import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";
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

// GET all doctors
export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctors = await prisma.doctor.findMany({
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

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Get doctors error:", error);
    return NextResponse.json(
      { message: "Failed to get doctors" },
      { status: 500 }
    );
  }
}

// Create doctor schema
const createDoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  specialization: z.string().optional(),
  education: z.string().optional(),
});

// POST create doctor (admin only)
export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can create doctors" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createDoctorSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user with DOCTOR role
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: "DOCTOR",
      },
    });

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: newUser.id,
        specialization: validatedData.specialization,
        education: validatedData.education,
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
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error("Create doctor error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create doctor" },
      { status: 500 }
    );
  }
}
