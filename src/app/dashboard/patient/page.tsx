"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { UserRole } from "@/types/user";
import { SlotStatus } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { doctors, fetchDoctors } = useDoctorStore();
  const { schedules, fetchDoctorSchedule } = useScheduleStore();

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch doctors
        await fetchDoctors();

        // Get all schedules
        const allSchedules: any[] = [];

        for (const doctor of doctors) {
          const schedule = await fetchDoctorSchedule(doctor.id);
          allSchedules.push({
            doctorId: doctor.id,
            doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization,
            slots: schedule.slots,
          });
        }

        // Find upcoming appointments for the current patient
        const today = new Date();
        const appointments = allSchedules.flatMap((schedule) =>
          schedule.slots
            .filter(
              (slot) =>
                slot.patientId === user?.id &&
                slot.status === SlotStatus.BOOKED &&
                new Date(`${slot.date}T${slot.startTime}`) >= today
            )
            .map((slot) => ({
              id: slot.id,
              doctorId: schedule.doctorId,
              doctorName: schedule.doctorName,
              specialization: schedule.specialization,
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }))
        );

        // Sort by date and time
        appointments.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });

        setUpcomingAppointments(appointments);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, fetchDoctors, doctors, fetchDoctorSchedule]);

  if (!user) return null;

  return (
    <DashboardLayout requiredRole={UserRole.PATIENT}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#273441]">
          Welcome, {user.firstName}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">Upcoming Appointments</CardTitle>
              <CardDescription className="text-[#51657A]">
                Your scheduled visits
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <p className="text-[#51657A]">Loading appointments...</p>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[#51657A] mb-4">
                    You have no upcoming appointments.
                  </p>
                  <Link href="/patient/doctors">
                    <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                      Book an Appointment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium text-[#273441]">
                          {appointment.doctorName}
                        </div>
                        <div className="text-sm text-[#51657A]">
                          {appointment.specialization}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-[#4B5563]">
                        {format(new Date(appointment.date), "MMMM d, yyyy")} at{" "}
                        {appointment.startTime}
                      </div>
                    </div>
                  ))}

                  {upcomingAppointments.length > 3 && (
                    <div className="text-center mt-2">
                      <Link href="/patient/appointments">
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

          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">Find Doctors</CardTitle>
              <CardDescription className="text-[#51657A]">
                Book appointments with specialists
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center py-4">
                <p className="text-[#51657A] mb-4">
                  Search for doctors by name or specialization
                </p>
                <Link href="/patient/doctors">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                    Browse Doctors
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-[#6D8CAD]/10 pb-2">
              <CardTitle className="text-[#273441]">Medical Records</CardTitle>
              <CardDescription className="text-[#51657A]">
                View your medical history
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center py-4">
                <p className="text-[#51657A] mb-4">
                  Access your complete medical history and doctor's notes
                </p>
                <Link href="/patient/medical-records">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                    View Records
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