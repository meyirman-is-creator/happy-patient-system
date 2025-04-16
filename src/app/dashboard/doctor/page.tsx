// src/app/dashboard/doctor/page.tsx
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
import { Calendar, Clock, User, FileText } from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { fetchDoctorSchedule } = useScheduleStore();

  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    upcomingTotal: 0,
  });
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
          (slot) => 
            (slot.date > todayStr && slot.status === SlotStatus.BOOKED) ||
            (slot.date === todayStr && slot.status === SlotStatus.BOOKED && 
             new Date(`${slot.date}T${slot.startTime}`) > new Date())
        );

        // Count completed appointments today
        const completedToday = schedule.slots.filter(
          (slot) => slot.date === todayStr && slot.status === SlotStatus.OCCUPIED
        ).length;

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
        const mockPatients: Record<string, { name: string, age: number, condition?: string }> = {
          patient1: { name: "John Doe", age: 42, condition: "Hypertension" },
          patient2: { name: "Jane Smith", age: 35, condition: "Migraine" },
          patient3: { name: "Alice Johnson", age: 29 },
          patient4: { name: "Robert Wilson", age: 58, condition: "Diabetes" },
          patient5: { name: "Emma Davis", age: 31, condition: "Anxiety" },
          patient6: { name: "Michael Brown", age: 44 },
        };

        // Add patient info to appointments
        const todayAppointmentsWithPatient = todaySlots.map((slot) => ({
          ...slot,
          patientName: slot.patientId
            ? mockPatients[slot.patientId]?.name || "Unknown Patient"
            : "No Patient",
          patientAge: slot.patientId
            ? mockPatients[slot.patientId]?.age || "N/A"
            : "N/A",
          patientCondition: slot.patientId
            ? mockPatients[slot.patientId]?.condition || "General Checkup"
            : "N/A",
        }));

        const upcomingAppointmentsWithPatient = upcomingSlots.map((slot) => ({
          ...slot,
          patientName: slot.patientId
            ? mockPatients[slot.patientId]?.name || "Unknown Patient"
            : "No Patient",
          patientAge: slot.patientId
            ? mockPatients[slot.patientId]?.age || "N/A"
            : "N/A",
          patientCondition: slot.patientId
            ? mockPatients[slot.patientId]?.condition || "General Checkup"
            : "N/A",
        }));

        setTodayAppointments(todayAppointmentsWithPatient);
        setUpcomingAppointments(upcomingAppointmentsWithPatient);
        
        // Set stats
        setStats({
          totalPatients: Object.keys(mockPatients).length,
          todayAppointments: todaySlots.length,
          completedToday: completedToday,
          upcomingTotal: upcomingSlots.length,
        });
        
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

  // if (!user) return null;

  return (
    <DashboardLayout requiredRole={UserRole.DOCTOR}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[#273441]">
            Welcome, Dr. {user?.lastName}!
          </h1>
          <p className="text-[#51657A]">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#51657A]">Today's Appointments</p>
                  <h3 className="text-3xl font-bold text-[#273441] mt-2">{stats.todayAppointments}</h3>
                </div>
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <Calendar className="h-6 w-6 text-[#007CFF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#51657A]">Completed Today</p>
                  <h3 className="text-3xl font-bold text-[#273441] mt-2">{stats.completedToday}</h3>
                </div>
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <Clock className="h-6 w-6 text-[#007CFF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#51657A]">Total Patients</p>
                  <h3 className="text-3xl font-bold text-[#273441] mt-2">{stats.totalPatients}</h3>
                </div>
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <User className="h-6 w-6 text-[#007CFF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#51657A]">Upcoming</p>
                  <h3 className="text-3xl font-bold text-[#273441] mt-2">{stats.upcomingTotal}</h3>
                </div>
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <FileText className="h-6 w-6 text-[#007CFF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-gray-200 overflow-hidden">
            <CardHeader className="bg-[#F9FAFB] border-b border-gray-200 pb-4">
              <CardTitle className="text-xl text-[#273441]">
                Today's Appointments
              </CardTitle>
              <CardDescription className="text-[#51657A]">
                {format(new Date(), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CFF]"></div>
                  </div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-[#51657A] mb-2">
                    No appointments scheduled for today.
                  </p>
                  <div className="mt-2">
                    <Link href="/doctor/schedule">
                      <Button variant="outline" className="text-[#007CFF] border-[#007CFF]">
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium text-[#273441]">
                              {appointment.patientName}
                            </div>
                            <span className="mx-2 text-gray-300">•</span>
                            <div className="text-sm text-[#51657A]">
                              {appointment.patientAge} years
                            </div>
                          </div>
                          <div className="text-sm text-[#51657A] mt-1">
                            {appointment.patientCondition}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge className="bg-[#F97316] text-white">
                            {appointment.startTime} - {appointment.endTime}
                          </Badge>
                          <Link href={`/doctor/appointments/${appointment.id}`}>
                            <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 overflow-hidden">
            <CardHeader className="bg-[#F9FAFB] border-b border-gray-200 pb-4">
              <CardTitle className="text-xl text-[#273441]">
                Upcoming Appointments
              </CardTitle>
              <CardDescription className="text-[#51657A]">
                Next scheduled visits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CFF]"></div>
                  </div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-[#51657A]">
                    No upcoming appointments scheduled.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[#273441]">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-[#51657A] mt-1">
                            {format(new Date(appointment.date), "EEE, MMM d")} • {appointment.startTime}
                          </div>
                        </div>
                        <Badge className="bg-[#6D8CAD]">
                          {appointment.patientCondition}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {upcomingAppointments.length > 5 && (
                    <div className="p-4 text-center">
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
          <Card className="bg-white border border-gray-200">
            <CardHeader className="bg-[#F9FAFB] border-b border-gray-200 pb-4">
              <CardTitle className="text-xl text-[#273441]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <Link href="/doctor/schedule">
                  <Button className="bg-[#273441] hover:bg-[#22303A] text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    View My Schedule
                  </Button>
                </Link>
                <Link href="/doctor/patients">
                  <Button className="bg-[#6D8CAD] hover:bg-[#5D7A97] text-white">
                    <User className="mr-2 h-4 w-4" />
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