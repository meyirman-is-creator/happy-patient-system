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
            take: 1, // Just to check if there's a recent appointment
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
