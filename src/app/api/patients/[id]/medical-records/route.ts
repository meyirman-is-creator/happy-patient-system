import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt";

// Определяем правильный тип для параметров маршрута
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET patient's medical records
export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // ... остальной код остается без изменений
    // Check permissions based on role
    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      // Patients can only access their own medical records
      if (!patientProfile || patientProfile.id !== params.id) {
        return NextResponse.json(
          { message: "Unauthorized to view these medical records" },
          { status: 403 }
        );
      }
    } else if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile) {
        return NextResponse.json(
          { message: "Doctor profile not found" },
          { status: 404 }
        );
      }

      // Check if doctor has appointments with this patient
      const hasAppointments = await prisma.appointment.findFirst({
        where: {
          doctorId: doctorProfile.id,
          patientId: params.id,
        },
      });

      if (!hasAppointments) {
        return NextResponse.json(
          { message: "Unauthorized to view these medical records" },
          { status: 403 }
        );
      }
    } else if (user.role === "ADMIN") {
      // Admins cannot access medical records
      return NextResponse.json(
        { message: "Administrators cannot access medical records" },
        { status: 403 }
      );
    }

    // Get the medical records with appointment details
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: params.id,
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        appointment: {
          startTime: "desc",
        },
      },
    });

    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error("Get medical records error:", error);
    return NextResponse.json(
      { message: "Failed to get medical records" },
      { status: 500 }
    );
  }
}
