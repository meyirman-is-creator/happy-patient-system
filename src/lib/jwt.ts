// src/lib/jwt.ts
import { jwtVerify, SignJWT } from "jose";
import prisma from "./prisma";

// Проверка токена и возврат ID пользователя
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "secret";
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secretKey);
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
    return null;
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "secret";
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.id as string;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Создание нового JWT токена
export async function createToken(payload: any): Promise<string> {
  const JWT_SECRET = process.env.JWT_SECRET || "secret";
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}