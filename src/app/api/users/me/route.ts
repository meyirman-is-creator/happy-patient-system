import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Define update profile schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
});

// Helper to get user ID from token
const getUserIdFromToken = (request: Request): string | null => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    try {
      // Make sure to use the exact same secret as when signing the token
      const decoded = verify(token, process.env.JWT_SECRET || "secret") as {
        id: string;
      };
      return decoded.id;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
};

// GET current user
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        patientProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Failed to get user information" },
      { status: 500 }
    );
  }
}

// PUT update current user
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateProfileSchema.parse(body);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      include: {
        doctorProfile: true,
        patientProfile: true,
        adminProfile: true,
      },
    });

    // Remove password from the response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Update user error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update user information" },
      { status: 500 }
    );
  }
}
