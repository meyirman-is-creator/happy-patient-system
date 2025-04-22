import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt";

// GET all patients (for doctors and admins)
export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only doctors and admins can view patient list
    if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized access to patient list" },
        { status: 403 }
      );
    }

    // ... остальной код остается без изменений
    // For doctors, get only patients who have appointments with them
    if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile) {
        return NextResponse.json(
          { message: "Doctor profile not found" },
          { status: 404 }
        );
      }

      // Get patients who have appointments with this doctor
      const doctorPatients = await prisma.patient.findMany({
        where: {
          appointments: {
            some: {
              doctorId: doctorProfile.id,
            },
          },
        },
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
          appointments: {
            where: {
              doctorId: doctorProfile.id,
            },
            orderBy: {
              startTime: "desc",
            },
            take: 1, // Просто для проверки есть ли недавняя запись
          },
        },
      });

      return NextResponse.json(doctorPatients);
    }

    // For admins, get all patients
    const patients = await prisma.patient.findMany({
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

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Get patients error:", error);
    return NextResponse.json(
      { message: "Failed to get patients" },
      { status: 500 }
    );
  }
}
