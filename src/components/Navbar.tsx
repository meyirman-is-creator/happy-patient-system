// src/components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Users,
  UserCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
interface UserType {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
}
interface PatientProfile {
  id: string;
  user: UserType;
}

interface DoctorProfile {
  id: string;
  user: UserType;
}
export function Navbar({ isOpen, setIsOpen }: NavbarProps) {
  const { user, logout } = useAuth() as {
    user: UserType | null;
    logout: () => void;
  };
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");
  
  // Check if viewing someone else's data
  const isViewingOtherCalendar = 
    (pathname === "/calendar") && 
    ((doctorId && doctorId !== user?.doctorProfile?.id) || 
     (patientId && patientId !== user?.patientProfile?.id));
  
  const isViewingOtherProfile = 
    (pathname === "/profile") && 
    (patientId && patientId !== user?.patientProfile?.id);

  // Make sure we have the necessary items in the sidebar
  const navItems = [
    {
      href: "/",
      label: "Главная",
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
      show: true, // Always show Home/Dashboard
    },
    {
      href: "/calendar",
      label: "Календарь",
      icon: <CalendarDays className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
      show: !isViewingOtherCalendar, // Hide when viewing someone else's calendar
    },
    {
      href: "/listing",
      label:
        user?.role === "PATIENT"
          ? "Врачи"
          : user?.role === "DOCTOR"
          ? "Мои пациенты"
          : "Управление пользователями",
      icon: <Users className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
      show: true, // Always show Listing
    },
    {
      href: "/profile",
      label: "Профиль",
      icon: <UserCircle className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
      show: !isViewingOtherProfile, // Hide when viewing someone else's profile
    },
  ];

  // Filter navItems by user role and show flag
  const filteredNavItems = user?.role
    ? navItems.filter((item) => item.roles.includes(user.role) && item.show)
    : [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 top-16 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-auto lg:flex w-64 bg-white border-r border-[#0A6EFF]/10 shadow-sm transition-transform duration-300 ease-in-out z-20`}
    >
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex-grow flex flex-col">
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#243352]/60">
              Меню
            </span>
          </div>
          <nav className="flex-1 px-2 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#0A6EFF]/10 text-[#0A6EFF] font-medium"
                      : "text-[#243352] hover:bg-[#0A6EFF]/5 hover:text-[#0A6EFF]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {React.cloneElement(item.icon, {
                    className: `${
                      isActive ? "text-[#0A6EFF]" : "text-[#243352]"
                    } h-5 w-5 mr-3`,
                  })}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {user && (
          <div className="px-4 py-4">
            <Button
              onClick={logout}
              className="w-full justify-start bg-white hover:bg-[#0A6EFF]/5 text-[#243352] hover:text-[#0A6EFF] border-2 border-[#0A6EFF]/10"
              variant="outline"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Выйти
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}