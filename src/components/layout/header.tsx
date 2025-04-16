// src/components/layout/header.tsx
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "U";
    return `${user?.firstName.charAt(0)}${user?.lastName.charAt(0)}`;
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/";

    switch (user.role) {
      case UserRole.PATIENT:
        return "/patient";
      case UserRole.DOCTOR:
        return "/doctor";
      case UserRole.ADMIN:
        return "/admin";
      default:
        return "/";
    }
  };

  const navigationItems = user ? [
    { label: "Dashboard", href: getDashboardPath() },
    ...(user.role === UserRole.PATIENT ? [
      { label: "Find Doctors", href: "/patient/doctors" },
      { label: "My Appointments", href: "/patient/appointments" },
      { label: "Medical Records", href: "/patient/medical-records" },
    ] : []),
    ...(user.role === UserRole.DOCTOR ? [
      { label: "My Schedule", href: "/doctor/schedule" },
      { label: "Patients", href: "/doctor/patients" },
    ] : []),
    ...(user.role === UserRole.ADMIN ? [
      { label: "Manage Doctors", href: "/admin/doctors" },
      { label: "Manage Schedules", href: "/admin/schedules" },
    ] : []),
  ] : [];

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-[#273441]">Happy Patient</h1>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#273441]"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#51657A] hover:text-[#273441] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User menu (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 bg-[#6D8CAD]">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{`${user?.firstName} ${user?.lastName}`}</span>
                    <span className="text-xs text-[#51657A] capitalize">{user?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-[#51657A] text-[#51657A] hover:text-[#273441]"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 px-3 rounded-md text-[#51657A] hover:bg-gray-50 hover:text-[#273441]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {!user ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <Link
                  href="/profile"
                  className="block py-2 px-3 rounded-md text-[#51657A] hover:bg-gray-50 hover:text-[#273441]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-3 rounded-md text-[#EF4444] hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-[#51657A] text-[#51657A] hover:text-[#273441]"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-[#007CFF] hover:bg-[#0070E6] text-white">
                      Register
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}