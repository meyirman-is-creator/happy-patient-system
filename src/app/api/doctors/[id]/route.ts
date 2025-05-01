import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/jwt";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET specific doctor
export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await props.params;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
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

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    return NextResponse.json(
      { message: "Failed to get doctor" },
      { status: 500 }
    );
  }
}

// Update doctor schema
const updateDoctorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  specialization: z.string().optional(),
  education: z.string().optional(),
});

// PUT update doctor (admin only)
export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await props.params;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can update doctors" },
        { status: 403 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateDoctorSchema.parse(body);

    // Extract user and doctor profile data
    const { firstName, lastName, phone, ...doctorData } = validatedData;

    // Start a transaction to update both user and doctor
    const updatedDoctor = await prisma.$transaction(async (tx) => {
      // Update user data if provided
      if (firstName || lastName || phone) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone: phone || undefined,
          },
        });
      }

      // Update doctor profile
      return tx.doctor.update({
        where: { id },
        data: doctorData,
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
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("Update doctor error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

// DELETE doctor (admin only)
export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await props.params;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can delete doctors" },
        { status: 403 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return NextResponse.json(
        { message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Delete the doctor (cascade will delete the user)
    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return NextResponse.json(
      { message: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
