// src/app/api/appointments/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Helper to get user from token
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
  } catch {
    return null;
  }
};

// Complete appointment schema
const completeAppointmentSchema = z.object({
  doctorNotes: z.string(),
});

// PUT complete appointment and add medical record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only doctors can complete appointments
    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only doctors can complete appointments" },
        { status: 403 }
      );
    }

    // Fetch current appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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

    // Verify doctor is assigned to this appointment
    const doctorProfile = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
      return NextResponse.json(
        { message: "Unauthorized to complete this appointment" },
        { status: 403 }
      );
    }

    // Can only complete appointments with status BOOKED or OCCUPIED
    if (appointment.status === "FREE") {
      return NextResponse.json(
        { message: "Cannot complete a free appointment" },
        { status: 400 }
      );
    }

    // Verify patient is assigned
    if (!appointment.patientId) {
      return NextResponse.json(
        { message: "No patient assigned to this appointment" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = completeAppointmentSchema.parse(body);

    // Create or update medical record
    let medicalRecord;

    if (appointment.medicalRecord) {
      // Update existing record
      medicalRecord = await prisma.medicalRecord.update({
        where: { id: appointment.medicalRecord.id },
        data: {
          doctorNotes: validatedData.doctorNotes,
        },
      });
    } else {
      // Create new record
      medicalRecord = await prisma.medicalRecord.create({
        data: {
          appointmentId: params.id,
          patientId: appointment.patientId,
          doctorNotes: validatedData.doctorNotes,
        },
      });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
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
