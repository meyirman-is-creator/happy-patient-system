// src/components/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Menu, HeartPulse, UserCircle, LogOut } from "lucide-react";
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

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-[#0A6EFF]/10 sticky top-0 z-30 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-[#243352] hover:bg-[#0A6EFF]/5 lg:hidden"
              onClick={toggleSidebar}
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
    </header>
  );
}
