// src/app/dashboard/patient/page.tsx
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
import { PlusCircle, Clock, Calendar, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { doctors, fetchDoctors } = useDoctorStore();
  const { schedules, fetchDoctorSchedule } = useScheduleStore();

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
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
        const todayStr = format(today, "yyyy-MM-dd");

        // Mock patientId (normally this would come from the user)
        const patientId = user?.id || "patient1";

        const appointments = allSchedules.flatMap((schedule) =>
          schedule.slots
            .filter(
              (slot) =>
                slot.patientId === patientId &&
                (slot.status === SlotStatus.BOOKED || slot.status === SlotStatus.OCCUPIED)
            )
            .map((slot) => ({
              id: slot.id,
              doctorId: schedule.doctorId,
              doctorName: schedule.doctorName,
              specialization: schedule.specialization,
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: slot.status,
            }))
        );

        // Separate into upcoming and past appointments
        const upcoming = appointments.filter(
          (app) => app.date > todayStr || 
                 (app.date === todayStr && 
                  new Date(`${app.date}T${app.startTime}`) > today)
        );
        
        const past = appointments.filter(
          (app) => app.date < todayStr || 
                 (app.date === todayStr && 
                  new Date(`${app.date}T${app.startTime}`) <= today)
        );

        // Sort by date and time
        upcoming.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        past.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateB.getTime() - dateA.getTime(); // Sort past appointments in reverse order
        });

        // Mock medical records
        const mockRecords = [
          {
            id: "record1",
            doctorName: "Dr. Jane Smith",
            specialization: "Cardiologist",
            visitDate: "2023-10-15",
            diagnosis: "Hypertension",
            notes: "Blood pressure slightly elevated. Recommended lifestyle changes and scheduled follow-up.",
          },
          {
            id: "record2",
            doctorName: "Dr. Michael Johnson",
            specialization: "Neurologist",
            visitDate: "2023-09-21",
            diagnosis: "Migraine",
            notes: "Experiencing frequent headaches. Prescribed medication and recommended keeping a trigger journal.",
          },
        ];

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
        setMedicalRecords(mockRecords);
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

  // if (!user) return null;

  return (
    <DashboardLayout requiredRole={UserRole.PATIENT}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[#273441]">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-[#51657A]">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <PlusCircle className="h-8 w-8 text-[#007CFF]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#273441]">Book Appointment</h3>
                  <p className="text-sm text-[#51657A] mt-1">
                    Find a specialist and schedule a visit
                  </p>
                </div>
                <Link href="/patient/doctors">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white w-full">
                    Find Doctors
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <Calendar className="h-8 w-8 text-[#007CFF]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#273441]">My Appointments</h3>
                  <p className="text-sm text-[#51657A] mt-1">
                    View or manage your scheduled visits
                  </p>
                </div>
                <Link href="/patient/appointments">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white w-full">
                    View Appointments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-[#EBF5FF] rounded-full">
                  <FileText className="h-8 w-8 text-[#007CFF]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#273441]">Medical Records</h3>
                  <p className="text-sm text-[#51657A] mt-1">
                    Access your health history and documents
                  </p>
                </div>
                <Link href="/patient/medical-records">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white w-full">
                    View Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardHeader className="bg-[#F9FAFB] border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#273441]">
                  Upcoming Appointments
                </CardTitle>
                <CardDescription className="text-[#51657A]">
                  Your scheduled upcoming visits
                </CardDescription>
              </div>
              {upcomingAppointments.length > 0 && (
                <Link href="/patient/appointments">
                  <Button variant="outline" className="text-[#007CFF] border-[#007CFF]">
                    View All
                  </Button>
                </Link>
              )}
            </div>
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
                <p className="text-[#51657A] mb-4">
                  You have no upcoming appointments.
                </p>
                <Link href="/patient/doctors">
                  <Button className="bg-[#007CFF] hover:bg-[#0070E6] text-white">
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-[#273441]">
                          {appointment.doctorName}
                        </div>
                        <div className="text-sm text-[#51657A] mt-1">
                          <Badge className="bg-[#6D8CAD] text-white mr-2">
                            {appointment.specialization}
                          </Badge>
                          {format(new Date(appointment.date), "EEEE, MMMM d")} at {appointment.startTime}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/patient/appointments/${appointment.id}`}>
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

        {/* Recent Medical Records */}
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <CardHeader className="bg-[#F9FAFB] border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-[#273441]">
                  Recent Medical Records
                </CardTitle>
                <CardDescription className="text-[#51657A]">
                  Your latest medical history
                </CardDescription>
              </div>
              {medicalRecords.length > 0 && (
                <Link href="/patient/medical-records">
                  <Button variant="outline" className="text-[#007CFF] border-[#007CFF]">
                    View All
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CFF]"></div>
                </div>
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-[#51657A]">
                  No medical records found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center">
                          <div className="font-medium text-[#273441]">
                            {record.doctorName}
                          </div>
                          <span className="mx-2 text-gray-300">•</span>
                          <div className="text-sm text-[#51657A]">
                            {record.specialization}
                          </div>
                        </div>
                        <div className="text-sm text-[#51657A] mt-2">
                          <strong>Visit date:</strong> {format(new Date(record.visitDate), "MMMM d, yyyy")}
                        </div>
                        <div className="text-sm text-[#51657A] mt-1">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </div>
                        <div className="text-sm text-[#51657A] mt-2 line-clamp-2">
                          {record.notes}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link href={`/patient/medical-records/${record.id}`}>
                          <Button variant="outline" className="text-[#007CFF] border-[#007CFF]">
                            View Full Record
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
      </div>
    </DashboardLayout>
  );
}