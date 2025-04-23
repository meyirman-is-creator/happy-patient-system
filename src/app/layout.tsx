// src/app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import Providers from "./providers";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [clientSide, setClientSide] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, loading, token, refreshUserData } = useAuth();

  // This effect ensures client-side rendering
  useEffect(() => {
    setClientSide(true);
  }, []);

  // This effect logs authentication state changes for debugging
  useEffect(() => {
    console.log("Auth state changed:", {
      userId: user?.id || "null",
      isAuthenticated,
      loading,
      token: token ? "exists" : "null",
      pathname,
    });
  }, [user, isAuthenticated, loading, token, pathname]);

  // This effect triggers a manual user data refresh if we have a token but no user
  useEffect(() => {
    const fetchUserIfNeeded = async () => {
      if (isAuthenticated && token && !user && !loading && clientSide) {
        console.log(
          "Layout detected token without user - refreshing user data"
        );
        await refreshUserData();
      }
    };

    fetchUserIfNeeded();
  }, [isAuthenticated, token, user, loading, refreshUserData, clientSide]);

  // Handle redirection in useEffect, not during render
  useEffect(() => {
    const isAuthRoute =
      pathname?.includes("/login") || pathname?.includes("/register");

    if (!isAuthRoute && !isAuthenticated && !loading && clientSide) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, pathname, router, clientSide]);

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

  // Show loading for unauthenticated users on protected routes
  if (!isAuthRoute && !isAuthenticated && !loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#0A6EFF] font-medium">
            Перенаправление на страницу входа...
          </div>
        </div>
      </main>
    );
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
