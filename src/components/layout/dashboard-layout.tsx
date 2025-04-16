import { ReactNode } from "react";
import { Header } from "./header";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/user";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const { user } = useAuthStore();

  // Check if user is logged in
  if (!user) {
    // Redirect to login page
    redirect("/login");
    return null;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case UserRole.PATIENT:
        redirect("/patient");
        break;
      case UserRole.DOCTOR:
        redirect("/doctor");
        break;
      case UserRole.ADMIN:
        redirect("/admin");
        break;
      default:
        redirect("/");
        break;
    }
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 container py-6">{children}</main>
      <footer className="py-4 bg-[#273441] text-white text-center">
        <div className="container">
          <p>&copy; 2025 Happy Patient System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}