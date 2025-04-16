import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  ClipboardList,
  Home,
  User,
  Clock,
  Menu,
  X,
  UserPlus,
  Calendar,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Define navigation items based on user role
  const navigationItems = (() => {
    switch (user.role) {
      case UserRole.PATIENT:
        return [
          {
            name: "Dashboard",
            href: "/patient",
            icon: Home,
          },
          {
            name: "Find Doctors",
            href: "/patient/doctors",
            icon: Users,
          },
          {
            name: "My Appointments",
            href: "/patient/appointments",
            icon: CalendarDays,
          },
          {
            name: "Medical Records",
            href: "/patient/medical-records",
            icon: ClipboardList,
          },
          {
            name: "Profile",
            href: "/profile",
            icon: User,
          },
        ];
      case UserRole.DOCTOR:
        return [
          {
            name: "Dashboard",
            href: "/doctor",
            icon: Home,
          },
          {
            name: "My Schedule",
            href: "/doctor/schedule",
            icon: Calendar,
          },
          {
            name: "Patients",
            href: "/doctor/patients",
            icon: Users,
          },
          {
            name: "Profile",
            href: "/profile",
            icon: User,
          },
        ];
      case UserRole.ADMIN:
        return [
          {
            name: "Dashboard",
            href: "/admin",
            icon: Home,
          },
          {
            name: "Manage Doctors",
            href: "/admin/doctors",
            icon: UserPlus,
          },
          {
            name: "Manage Schedules",
            href: "/admin/schedules",
            icon: Clock,
          },
          {
            name: "Reports",
            href: "/admin/reports",
            icon: FileText,
          },
          {
            name: "Profile",
            href: "/profile",
            icon: User,
          },
        ];
      default:
        return [];
    }
  })();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border-[#E5E7EB]"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-[#273441]" />
          ) : (
            <Menu className="h-5 w-5 text-[#273441]" />
          )}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-20 h-full w-64 bg-white border-r border-[#E5E7EB] transition-transform duration-300 transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:h-auto",
          className
        )}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo/Brand */}
          <div className="px-6 mb-8">
            <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <h1 className="text-xl font-bold text-[#273441]">Happy Patient</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#007CFF]/10 text-[#007CFF]"
                        : "text-[#51657A] hover:bg-[#F9FAFB] hover:text-[#273441]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isActive
                          ? "text-[#007CFF]"
                          : "text-[#6D8CAD]"
                      )}
                    />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="px-6 mt-6">
            <div className="p-3 bg-[#F9FAFB] rounded-md">
              <div className="text-sm font-medium text-[#273441]">
                {`${user.firstName} ${user.lastName}`}
              </div>
              <div className="text-xs text-[#51657A] capitalize">
                {user.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}