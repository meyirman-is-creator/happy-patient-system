import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const getUserFromToken = async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET || "secret") as {
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

const completeAppointmentSchema = z.object({
  notes: z.string(),
});

export async function PUT(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only doctors can complete appointments" },
        { status: 403 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
      include: {
        medicalRecord: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    const doctorProfile = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
      return NextResponse.json(
        { message: "Unauthorized to complete this appointment" },
        { status: 403 }
      );
    }

    if (appointment.status === "FREE") {
      return NextResponse.json(
        { message: "Cannot complete a free appointment" },
        { status: 400 }
      );
    }

    if (!appointment.patientId) {
      return NextResponse.json(
        { message: "No patient assigned to this appointment" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = completeAppointmentSchema.parse(body);

    if (appointment.medicalRecord) {
      await prisma.medicalRecord.update({
        where: { id: appointment.medicalRecord.id },
        data: {
          doctorNotes: validatedData.notes,
        },
      });
    } else {
      await prisma.medicalRecord.create({
        data: {
          appointmentId: id,
          patientId: appointment.patientId,
          doctorNotes: validatedData.notes,
        },
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: "OCCUPIED",
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
    console.error("Complete appointment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to complete appointment" },
      { status: 500 }
    );
  }
}
