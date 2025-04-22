import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createToken } from "@/lib/jwt";

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        doctorProfile: true,
        patientProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token with jose - include only necessary fields
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    console.log("Creating token with payload:", payload);
    
    const token = await createToken(payload);

    // Log created token (first few characters only for security)
    console.log("Token created:", token.substring(0, 10) + "...");

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Return user data and token
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}