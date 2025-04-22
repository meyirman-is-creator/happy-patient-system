"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Prevent redirect loops
    if (!loading && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, isRedirecting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user && !loading && !isRedirecting) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </>
  );
}
