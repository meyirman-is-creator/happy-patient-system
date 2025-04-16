"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDoctorStore } from "@/store/doctor-store";
import { useScheduleStore } from "@/store/schedule-store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types/user";
import { SlotStatus } from "@/types/appointment";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { doctors, fetchDoctors } = useDoctorStore();
  const { schedules, fetchDoctorSchedule } = useScheduleStore();

  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    freeSlots: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  return (
    <DashboardLayout requiredRole={UserRole.ADMIN}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#273441]">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#273441]">
                Total Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#007CFF]">
                {isLoading ? "..." : stats.totalDoctors}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#273441]">
                Total Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#007CFF]">
                {isLoading ? "..." : stats.totalAppointments}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#273441]">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#007CFF]">
                {isLoading ? "..." : stats.appointmentsToday}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#273441]">
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#007CFF]">
                {isLoading ? "..." : stats.freeSlots}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">Manage Doctors</TabsTrigger>
            <TabsTrigger value="schedules">Manage Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader className="bg-[#6D8CAD]/10 pb-2">
                <CardTitle className="text-[#273441]">
                  Doctors Management
                </CardTitle>
                <CardDescription className="text-[#51657A]">
                  Add, edit or remove doctors from the system
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-[#51657A]">
                    You currently have{" "}
                    <span className="font-medium text-[#273441]">
                      {stats.totalDoctors}
                    </span>{" "}
                    doctors registered in the system.
                  </p>

                  <Link href="/admin/doctors/add">
                    <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                      Add New Doctor
                    </Button>
                  </Link>
                </div>

                <div className="mt-6">
                  <Link href="/admin/doctors">
                    <Button
                      variant="outline"
                      className="w-full border-[#51657A] text-[#51657A] hover:text-[#273441]"
                    >
                      View All Doctors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader className="bg-[#6D8CAD]/10 pb-2">
                <CardTitle className="text-[#273441]">
                  Schedule Management
                </CardTitle>
                <CardDescription className="text-[#51657A]">
                  Set up and modify doctors' schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-[#51657A]">
                    There are{" "}
                    <span className="font-medium text-[#273441]">
                      {stats.freeSlots}
                    </span>{" "}
                    available slots across all doctors.
                  </p>

                  <Link href="/admin/schedules/create">
                    <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                      Create New Schedule
                    </Button>
                  </Link>
                </div>

                <div className="mt-6">
                  <Link href="/admin/schedules">
                    <Button
                      variant="outline"
                      className="w-full border-[#51657A] text-[#51657A] hover:text-[#273441]"
                    >
                      Manage All Schedules
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
