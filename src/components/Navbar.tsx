"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  UsersIcon,
  UserIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const navItems = [
    ...(user.role !== "PATIENT"
      ? [
          {
            href: "/",
            label: "Dashboard",
            icon: <LayoutDashboardIcon className="h-5 w-5 mr-2" />,
          },
        ]
      : []),
    {
      href: "/calendar",
      label: "Calendar",
      icon: <CalendarIcon className="h-5 w-5 mr-2" />,
    },
    {
      href: "/listing",
      label:
        user.role === "PATIENT"
          ? "Doctors"
          : user.role === "DOCTOR"
          ? "My Patients"
          : "Manage Users",
      icon: <UsersIcon className="h-5 w-5 mr-2" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <UserIcon className="h-5 w-5 mr-2" />,
    },
  ];

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b-2 border-blue-100 dark:border-blue-950/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href={user.role === "PATIENT" ? "/calendar" : "/"}
                className="font-bold text-xl text-blue-700 dark:text-blue-300"
              >
                Happy Patient
              </Link>
            </div>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                    } transition-colors`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-2 border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Avatar className="h-full w-full bg-blue-100 dark:bg-blue-900/30">
                    <AvatarFallback className="text-blue-700 dark:text-blue-300 font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg shadow-lg"
              >
                <DropdownMenuLabel className="text-blue-800 dark:text-blue-300 font-medium">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-100 dark:bg-blue-900/30" />
                <DropdownMenuItem
                  asChild
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md cursor-pointer"
                >
                  <Link
                    href="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <LogOutIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-blue-100 dark:border-gray-800">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                  } transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors"
            >
              <LogOutIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
