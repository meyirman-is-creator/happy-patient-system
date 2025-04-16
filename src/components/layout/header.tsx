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

export function Header() {
  const { user, logout } = useAuthStore();

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
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

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#273441]">Happy Patient</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link
                href={getDashboardPath()}
                className="text-[#51657A] hover:text-[#273441] transition-colors"
              >
                Dashboard
              </Link>

              {user.role === UserRole.PATIENT && (
                <>
                  <Link
                    href="/patient/doctors"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    Find Doctors
                  </Link>
                  <Link
                    href="/patient/appointments"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    My Appointments
                  </Link>
                  <Link
                    href="/patient/medical-records"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    Medical Records
                  </Link>
                </>
              )}

              {user.role === UserRole.DOCTOR && (
                <>
                  <Link
                    href="/doctor/schedule"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    My Schedule
                  </Link>
                  <Link
                    href="/doctor/patients"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    Patients
                  </Link>
                </>
              )}

              {user.role === UserRole.ADMIN && (
                <>
                  <Link
                    href="/admin/doctors"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    Manage Doctors
                  </Link>
                  <Link
                    href="/admin/schedules"
                    className="text-[#51657A] hover:text-[#273441] transition-colors"
                  >
                    Manage Schedules
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
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
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                    <span className="text-xs text-[#51657A]">{user.role}</span>
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
    </header>
  );
}
