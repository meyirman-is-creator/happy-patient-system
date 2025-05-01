import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt";

// Определяем тип для параметров маршрута
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET specific patient
export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const params = await props.params;
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // Check permissions based on role
    if (user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      // Patients can only access their own profile
      if (!patientProfile || patientProfile.id !== params.id) {
        return NextResponse.json(
          { message: "Unauthorized to view this patient profile" },
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
          { message: "Unauthorized to view this patient profile" },
          { status: 403 }
        );
      }
    }
    // Admin can view any patient

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Get patient error:", error);
    return NextResponse.json(
      { message: "Failed to get patient" },
      { status: 500 }
    );
  }
}
