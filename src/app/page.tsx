"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/lib/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
    // Wait a short time to ensure auth state is loaded properly
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after the component has mounted and auth has been checked
    if (
      initialized &&
      !loading &&
      !isAuthenticated &&
      !isRedirecting &&
      !pathname.includes("/login") &&
      !pathname.includes("/register")
    ) {
      console.log("Not authenticated, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, isRedirecting, initialized, pathname]);

  if (!clientSide) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <Providers>
            <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-blue-600 dark:text-blue-400 font-medium">
                  Loading...
                </div>
              </div>
            </main>
            <Toaster />
          </Providers>
        </body>
      </html>
    );
  }

  if (loading || !initialized) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <Providers>
            <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-blue-600 dark:text-blue-400 font-medium">
                  Loading...
                </div>
              </div>
            </main>
            <Toaster />
          </Providers>
        </body>
      </html>
    );
  }

  const showNavbar = isAuthenticated && user;
  const isAuthRoute =
    pathname.includes("/login") || pathname.includes("/register");

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
            {showNavbar && !isAuthRoute && <Navbar />}
            {isAuthRoute ? (
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md space-y-8">
                  <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">
                      Happy Patient
                    </h1>
                    <p className="mt-3 text-sm text-blue-600/70 dark:text-blue-400/70">
                      Medical center appointment management system
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border-2 border-blue-100 dark:border-blue-900/30">
                    {children}
                  </div>
                </div>
              </div>
            ) : (
              <div className="container mx-auto px-4 py-8">{children}</div>
            )}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
