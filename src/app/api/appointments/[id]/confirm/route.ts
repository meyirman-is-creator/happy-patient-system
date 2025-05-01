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
    console.log(error);
    return null;
  }
};

// PUT confirm patient arrival
export async function PUT(request: Request) {
  try {
    // Extract appointment ID from the URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    // Only doctors can confirm patient arrival
    if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only doctors can confirm patient arrival" },
        { status: 403 }
      );
    }

    // Fetch current appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify doctor is assigned to this appointment
    if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
        return NextResponse.json(
          { message: "Unauthorized to confirm this appointment" },
          { status: 403 }
        );
      }
    }

    // Can only confirm BOOKED appointments
    if (appointment.status !== "BOOKED") {
      return NextResponse.json(
        { message: "Can only confirm booked appointments" },
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

    // Update appointment status
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
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Confirm appointment error:", error);
    return NextResponse.json(
      { message: "Failed to confirm appointment" },
      { status: 500 }
    );
  }
}
