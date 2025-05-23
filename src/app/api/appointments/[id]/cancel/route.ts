import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Define RouteParams type
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// Helper to get user from token
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

// PUT mark patient as no-show (cancel)
export async function PUT(request: NextRequest, props: RouteParams) {
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

    // Only doctors or admins can mark no-show
    if (user.role !== "DOCTOR" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only doctors or admins can mark no-show" },
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

    // Verify doctor is assigned to this appointment (if a doctor is cancelling)
    if (user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
        return NextResponse.json(
          { message: "Unauthorized to cancel this appointment" },
          { status: 403 }
        );
      }
    }

    // Can only cancel BOOKED appointments
    if (appointment.status !== "BOOKED") {
      return NextResponse.json(
        { message: "Can only mark booked appointments as no-show" },
        { status: 400 }
      );
    }

    // Reset the appointment to FREE status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        patientId: null,
        title: null,
        symptoms: null,
        status: "FREE",
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
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}