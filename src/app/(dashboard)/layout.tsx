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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Wait a short time to ensure auth state is loaded properly
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after the component has mounted and auth has been checked
    if (initialized && !loading && !isAuthenticated && !isRedirecting) {
      console.log("Not authenticated, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, isRedirecting, initialized]);

  if (loading || !initialized) {
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
