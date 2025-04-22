import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

// Define paths that do not require authentication
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.includes(path))) {
    return NextResponse.next();
  }

  // Check if it's an API route
  if (pathname.startsWith("/api")) {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(`Unauthorized API request to ${pathname}: No auth header`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
      // Use exactly the same secret for JWT verification
      const JWT_SECRET = process.env.JWT_SECRET || "qwerty";
      verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error(`Token verification error for ${pathname}:`, error);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  }

  // For client-side routes, check localStorage in the component
  return NextResponse.next();
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match all protected pages
    "/((?!login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};