"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth-store";
import { useScheduleStore } from "@/store/schedule-store";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/user";
import { SlotStatus } from "@/types/appointment";
import Link from "next/link";

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { fetchDoctorSchedule } = useScheduleStore();

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return;

        setIsLoading(true);

        // Fetch doctor's schedule
        const schedule = await fetchDoctorSchedule(user.id);

        // Get current date
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        // Filter today's appointments
        const todaySlots = schedule.slots.filter(
          (slot) => slot.date === todayStr && slot.status === SlotStatus.BOOKED
        );

        // Filter upcoming appointments (future dates)
        const upcomingSlots = schedule.slots.filter(
          (slot) => slot.date > todayStr && slot.status === SlotStatus.BOOKED
        );

        // Sort by time
        todaySlots.sort((a, b) => {
          return a.startTime.localeCompare(b.startTime);
        });

        // Sort by date and time
        upcomingSlots.sort((a, b) => {
          return (
            a.date.localeCompare(b.date) ||
            a.startTime.localeCompare(b.startTime)
          );
        });

        // Mock patient data (in a real app, this would come from an API)
        const mockPatients: Record<string, { name: string }> = {
          patient1: { name: "John Doe" },
          patient2: { name: "Jane Smith" },
          patient3: { name: "Alice Johnson" },
        };

        // Add patient info to appointments
        const todayAppointmentsWithPatient = todaySlots.map((slot) => ({
          ...slot,
          patientName: slot.patientId
            ? mockPatients[slot.patientId]?.name || "Unknown Patient"
            : "No Patient",
        }));

        const upcomingAppointmentsWithPatient = upcomingSlots.map((slot) => ({
          ...slot,
          patientName: slot.patientId
            ? mockPatients[slot.patientId]?.name || "Unknown Patient"
            : "No Patient",
        }));

        setTodayAppointments(todayAppointmentsWithPatient);
        setUpcomingAppointments(upcomingAppointmentsWithPatient);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchDoctorSchedule]);

  if (!user) return null;

  return (
    <DashboardLayout requiredRole={UserRole.DOCTOR}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#273441]">
          Welcome, Dr. {user.lastName}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">
                Today's Appointments
              </CardTitle>
              <CardDescription className="text-[#51657A]">
                {format(new Date(), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <p className="text-[#51657A]">Loading appointments...</p>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#51657A]">
                    No appointments scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium text-[#273441]">
                          {appointment.patientName}
                        </div>
                        <Badge className="bg-[#F97316]">
                          {appointment.startTime} - {appointment.endTime}
                        </Badge>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Link href={`/doctor/appointments/${appointment.id}`}>
                          <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">
                Upcoming Appointments
              </CardTitle>
              <CardDescription className="text-[#51657A]">
                Next scheduled visits
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <p className="text-[#51657A]">Loading appointments...</p>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#51657A]">
                    No upcoming appointments scheduled.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium text-[#273441]">
                          {appointment.patientName}
                        </div>
                        <div className="text-sm text-[#51657A]">
                          {format(new Date(appointment.date), "MMM d")}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-[#4B5563]">
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </div>
                  ))}

                  {upcomingAppointments.length > 5 && (
                    <div className="text-center mt-2">
                      <Link href="/doctor/appointments">
                        <Button variant="link" className="text-[#007CFF]">
                          View all appointments
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <Link href="/doctor/schedule">
                  <Button className="bg-[#273441] hover:bg-[#22303A]">
                    View My Schedule
                  </Button>
                </Link>
                <Link href="/doctor/patients">
                  <Button className="bg-[#6D8CAD] hover:bg-[#5D7A97]">
                    Patient Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
