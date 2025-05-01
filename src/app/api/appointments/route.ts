import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { addMinutes } from "date-fns";
// Удаляем неиспользуемый импорт AppointmentQueryParams

// Определяем более конкретный тип для объекта запроса
interface AppointmentQuery {
  doctorId?: string;
  patientId?: string;
  startTime?: {
    gte?: Date;
  };
  endTime?: {
    lte?: Date;
  };
}

// Helper to get user from token
const getUserFromToken = async (request: Request) => {
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
  } catch  {
    // Используем _ для обозначения неиспользуемого параметра
    return null;
  }
};

// GET appointments with filtering
export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: AppointmentQuery = {}; // Используем типизированный объект вместо Record<string, any>

    // Filter by doctor or patient based on role
    if (user.role === "DOCTOR") {
      // Find doctor profile ID
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile) {
        return NextResponse.json(
          { message: "Doctor profile not found" },
          { status: 404 }
        );
      }

      // Doctor can see only their appointments
      query.doctorId = doctorProfile.id;

      // Doctor can filter for a specific patient
      if (patientId) {
        query.patientId = patientId;
      }
    } else if (user.role === "PATIENT") {
      // Find patient profile ID
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientProfile) {
        return NextResponse.json(
          { message: "Patient profile not found" },
          { status: 404 }
        );
      }

      // Patient can see only their appointments
      query.patientId = patientProfile.id;

      // Patient can filter for a specific doctor
      if (doctorId) {
        query.doctorId = doctorId;
      }
    } else if (user.role === "ADMIN") {
      // Admin can filter by any criteria
      if (doctorId) {
        query.doctorId = doctorId;
      }
      if (patientId) {
        query.patientId = patientId;
      }
    }

    // Date range filtering
    if (startDate) {
      query.startTime = {
        ...query.startTime,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      query.endTime = {
        ...query.endTime,
        lte: new Date(endDate),
      };
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: query,
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
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { message: "Failed to get appointments" },
      { status: 500 }
    );
  }
}

// Create appointment schema
const createAppointmentSchema = z.object({
  doctorId: z.string(),
  patientId: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  duration: z.number().min(30).max(180),
  title: z.string().optional(),
  symptoms: z.string().optional(),
});

// POST create appointment
export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = createAppointmentSchema.parse(body);

    // Calculate end time based on duration (in minutes)
    const endTime = addMinutes(validatedData.startTime, validatedData.duration);

    // For patients, use their own ID
    let patientId = validatedData.patientId;

    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientProfile) {
        return NextResponse.json(
          { message: "Patient profile not found" },
          { status: 404 }
        );
      }

      patientId = patientProfile.id;
    }

    // Check if the slot is already taken
    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: validatedData.doctorId,
        NOT: {
          status: "FREE",
        },
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
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
              { startTime: { gte: validatedData.startTime } },
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

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: validatedData.doctorId,
        patientId,
        startTime: validatedData.startTime,
        endTime,
        title: validatedData.title,
        symptoms: validatedData.symptoms,
        status: patientId ? "BOOKED" : "FREE",
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
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
