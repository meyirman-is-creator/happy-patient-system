// src/app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import Providers from "./providers";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clientSide, setClientSide] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    setClientSide(true);
  }, []);

  if (!clientSide) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#0A6EFF] font-medium">
            Загрузка...
          </div>
        </div>
      </main>
    );
  }

  const isAuthRoute =
    pathname?.includes("/login") || pathname?.includes("/register");

  // Don't show protected routes until authentication is confirmed
  if (!isAuthRoute && loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#0A6EFF] font-medium">
            Проверка авторизации...
          </div>
        </div>
      </main>
    );
  }

  // Redirect to login if not authenticated and not on auth route
  if (!isAuthRoute && !isAuthenticated && !loading) {
    // We're using client-side navigation here
    if (typeof window !== "undefined") {
      window.location.href = "/login";
      return null;
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {!isAuthRoute && (
        <>
          <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <div className="flex">
            <Navbar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-10 bg-black bg-opacity-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            <div className="flex-1">{children}</div>
          </div>
        </>
      )}

      {isAuthRoute && children}
    </main>
  );
}
