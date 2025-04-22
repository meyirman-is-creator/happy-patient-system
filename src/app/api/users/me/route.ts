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
      console.log("No valid Authorization header found");
      return null;
    }

    const token = authHeader.split(" ")[1];
    console.log("Token from header:", token.substring(0, 10) + "...");

    // Ensure we use exactly the same secret for verification
    const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
    console.log("Using secret:", JWT_SECRET.substring(0, 3) + "..." + JWT_SECRET.substring(JWT_SECRET.length - 3));

    try {
      const decoded = verify(token, JWT_SECRET) as { id: string };
      console.log("Successfully decoded token. User ID:", decoded.id);
      return decoded.id;
    } catch (error) {
      console.error("Token verification error:", error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
      }
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
    console.log("GET /api/users/me - Request received");
    
    const userId = getUserIdFromToken(request);

    if (!userId) {
      console.log("Unauthorized - No valid user ID from token");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching user with ID:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        patientProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      console.log("User not found with ID:", userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user;
    console.log("User found, returning data");

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