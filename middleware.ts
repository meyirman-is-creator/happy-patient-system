import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Пути, которые не требуют аутентификации
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, является ли путь публичным
  if (publicPaths.some((path) => pathname.includes(path))) {
    return NextResponse.next();
  }

  // Проверяем, является ли это API-маршрутом
  if (pathname.startsWith("/api")) {
    // Получаем заголовок авторизации
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Извлекаем токен
    const token = authHeader.split(" ")[1];

    try {
      // Используем jose вместо jsonwebtoken
      const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
      const secretKey = new TextEncoder().encode(JWT_SECRET);

      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
