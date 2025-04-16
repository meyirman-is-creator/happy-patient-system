"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { LoginForm } from "@/components/auth/login-form";
import { UserRole } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case UserRole.PATIENT:
          router.push("/patient");
          break;
        case UserRole.DOCTOR:
          router.push("/doctor");
          break;
        case UserRole.ADMIN:
          router.push("/admin");
          break;
        default:
          router.push("/");
          break;
      }
    }
  }, [user, router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-[#273441]">
          Happy Patient System
        </h1>
        <p className="text-center text-[#51657A] mt-2">Medical Center Management</p>
      </div>
      
      <LoginForm />
    </div>
  );
}