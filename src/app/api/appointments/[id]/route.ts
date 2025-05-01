import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { addMinutes } from "date-fns";

// Обновлено: изменен тип request на NextRequest
const getUserFromToken = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "qwerty") as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Обновлено: исправлен тип Props - заменен provider на id
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// Обновлена сигнатура GET метода
export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        medicalRecord: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientProfile || patientProfile.id !== appointment.patientId) {
        return NextResponse.json(
          { message: "Unauthorized to view this appointment" },
          { status: 403 }
        );
      }
    } else if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
        return NextResponse.json(
          { message: "Unauthorized to view this appointment" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    return NextResponse.json(
      { message: "Failed to get appointment" },
      { status: 500 }
    );
  }
}

const updateAppointmentSchema = z.object({
  startTime: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  duration: z.number().min(30).max(180).optional(),
  title: z.string().optional(),
  symptoms: z.string().optional(),
  status: z.enum(["FREE", "BOOKED", "OCCUPIED"]).optional(),
});

// Обновлена сигнатура PUT метода
export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientProfile || patientProfile.id !== appointment.patientId) {
        return NextResponse.json(
          { message: "Unauthorized to update this appointment" },
          { status: 403 }
        );
      }

      if (appointment.status === "OCCUPIED") {
        return NextResponse.json(
          { message: "Cannot update a completed appointment" },
          { status: 400 }
        );
      }
    } else if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
        return NextResponse.json(
          { message: "Unauthorized to update this appointment" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = updateAppointmentSchema.parse(body);

    let endTime = appointment.endTime;

    if (validatedData.startTime) {
      const duration =
        validatedData.duration ||
        (appointment.endTime.getTime() - appointment.startTime.getTime()) /
          60000;
      endTime = addMinutes(validatedData.startTime, duration);
    } else if (validatedData.duration) {
      endTime = addMinutes(appointment.startTime, validatedData.duration);
    }

    if (validatedData.startTime || validatedData.duration) {
      const startTime = validatedData.startTime || appointment.startTime;

      const overlappingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          NOT: {
            OR: [{ id: params.id }, { status: "FREE" }],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (overlappingAppointment) {
        return NextResponse.json(
          { message: "The selected time slot is already booked" },
          { status: 409 }
        );
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        startTime: validatedData.startTime,
        endTime,
        title: validatedData.title,
        symptoms: validatedData.symptoms,
        status: validatedData.status,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        medicalRecord: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// Обновлена сигнатура DELETE метода
export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;

    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientProfile || patientProfile.id !== appointment.patientId) {
        return NextResponse.json(
          { message: "Unauthorized to delete this appointment" },
          { status: 403 }
        );
      }

      if (appointment.status === "OCCUPIED") {
        return NextResponse.json(
          { message: "Cannot cancel a completed appointment" },
          { status: 400 }
        );
      }

      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          patientId: null,
          title: null,
          symptoms: null,
          status: "FREE",
        },
      });

      return NextResponse.json({
        message: "Appointment cancelled successfully",
      });
    } else if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
        return NextResponse.json(
          { message: "Unauthorized to delete this appointment" },
          { status: 403 }
        );
      }

      if (appointment.status === "BOOKED") {
        await prisma.appointment.update({
          where: { id: params.id },
          data: {
            patientId: null,
            title: null,
            symptoms: null,
            status: "FREE",
          },
        });
      } else {
        await prisma.appointment.delete({
          where: { id: params.id },
        });
      }

      return NextResponse.json({ message: "Appointment deleted successfully" });
    } else if (user.role === "ADMIN") {
      await prisma.appointment.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ message: "Appointment deleted successfully" });
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { message: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
