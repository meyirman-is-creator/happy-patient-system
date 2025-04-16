// src/components/layout/dashboard-layout.tsx
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
//   if (!user) {
//     redirect("/login");
//     return null;
//   }

//   // Check if user has required role
//   if (requiredRole && user.role !== requiredRole) {
//     switch (user.role) {
//       case UserRole.PATIENT:
//         redirect("/patient");
//         break;
//       case UserRole.DOCTOR:
//         redirect("/doctor");
//         break;
//       case UserRole.ADMIN:
//         redirect("/admin");
//         break;
//       default:
//         redirect("/");
//         break;
//     }
//     return null;
//   }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {children}
      </main>
      <footer className="py-4 bg-[#273441] text-white text-center">
        <div className="container mx-auto px-4">
          <p>&copy; 2025 Happy Patient System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}