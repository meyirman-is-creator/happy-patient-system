"use client";

import { Inter } from "next/font/google";
import Providers from "./providers";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import './globals.css'
const inter = Inter({ subsets: ["latin"] });

// Это компонент без логики авторизации, чтобы избежать циклической зависимости
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

// Компонент, который использует useAuth и другие хуки
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clientSide, setClientSide] = useState(false);

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

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {!isAuthRoute && <Navbar />}
      {children}
    </main>
  );
}
