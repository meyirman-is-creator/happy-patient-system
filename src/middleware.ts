import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

// Define paths that do not require authentication
const publicPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if it's an API route (exclude authentication routes)
  if (
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/auth/login") &&
    !pathname.startsWith("/api/auth/register")
  ) {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      verify(token, process.env.JWT_SECRET || "secret");
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  }

  // For client-side routes, check cookie/localStorage in the component
  return NextResponse.next();
}

// Configure the middleware to run only for specific paths
export const config = {
  matcher: [
    // Match all API routes except auth routes
    "/api/:path*",
    // Match all protected pages
    "/",
    "/calendar/:path*",
    "/listing/:path*",
    "/profile/:path*",
  ],
};
