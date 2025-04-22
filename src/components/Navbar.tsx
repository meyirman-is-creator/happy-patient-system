"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  UserCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  HeartPulse,
  Home,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    {
      href: "/",
      label: "Главная",
      icon: <Home className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
    },
    {
      href: "/calendar",
      label: "Календарь",
      icon: <CalendarDays className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
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
    },
    {
      href: "/profile",
      label: "Профиль",
      icon: <UserCircle className="h-5 w-5 mr-2" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
    },
  ];

  const filteredNavItems = user?.role
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase();
  };

  return (
    <>
      {/* Top navbar */}
      <nav className="bg-white border-b border-[#0A6EFF]/10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                className="p-2 rounded-md text-[#243352] hover:bg-[#0A6EFF]/5 lg:hidden"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/" className="flex items-center ml-2 lg:ml-0">
                <div className="w-10 h-10 rounded-full bg-[#0A6EFF] flex items-center justify-center">
                  <HeartPulse className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 font-bold text-xl text-[#243352]">
                  Happy Patient
                </span>
              </Link>
            </div>

            <div className="flex items-center">
              {user && (
                <>
                  <span className="hidden md:block mr-4 text-[#243352]">
                    {user.firstName} {user.lastName}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full hover:bg-[#0A6EFF]/5"
                      >
                        <Avatar className="h-full w-full bg-[#0A6EFF]/10">
                          <AvatarFallback className="text-[#0A6EFF] font-medium">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white border border-[#0A6EFF]/10 rounded-lg shadow-lg"
                    >
                      <DropdownMenuLabel className="text-[#243352] font-medium">
                        Мой аккаунт
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#0A6EFF]/10" />
                      <DropdownMenuItem
                        asChild
                        className="hover:bg-[#0A6EFF]/5 rounded-md cursor-pointer"
                      >
                        <Link
                          href="/profile"
                          className="text-[#243352] hover:text-[#0A6EFF]"
                        >
                          <UserCircle className="h-4 w-4 mr-2 text-[#0A6EFF]" />
                          Профиль
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={logout}
                        className="hover:bg-[#0A6EFF]/5 rounded-md cursor-pointer text-[#243352] hover:text-[#0A6EFF]"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-[#0A6EFF]" />
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex h-screen">
        <aside
          className={`fixed inset-y-0 left-0 top-16 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                      onClick={() => setSidebarOpen(false)}
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

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black bg-opacity-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </>
  );
}
