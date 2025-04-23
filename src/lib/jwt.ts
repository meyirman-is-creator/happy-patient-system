// src/lib/jwt.ts
import { jwtVerify, SignJWT } from "jose";
import prisma from "./prisma";

// Проверка токена и возврат ID пользователя
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secretKey);
    console.log("Token verified, payload:", JSON.stringify(payload));
    return payload.id as string;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Получение пользователя из токена (для API роутов)
export async function getUserFromToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid Authorization header found");
    return null;
  }

  const token = authHeader.split(" ")[1];
  console.log("Processing token:", token.substring(0, 10) + "...");

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.id as string;
    console.log("Token payload:", JSON.stringify(payload));

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found for token payload:", userId);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Создание нового JWT токена
export async function createToken(payload: any): Promise<string> {
  const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  console.log("Creating token with payload:", JSON.stringify(payload));

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}
