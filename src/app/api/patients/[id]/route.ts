import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
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
  } catch (error) {
    return null;
  }
};

// GET specific patient
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
