"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/Calendar";
import { useDoctors } from "@/lib/hooks/useQueries";
import { useAuth } from "@/lib/hooks/useAuth";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");
  const patientId = searchParams.get("patientId");

  const { user } = useAuth();
  const { data: doctors = [], isLoading } = useDoctors();

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || "");

  // Update selectedDoctorId when doctorId in URL changes
  useEffect(() => {
    if (doctorId) {
      setSelectedDoctorId(doctorId);
    }
  }, [doctorId]);

  // For doctors, default to their own calendar
  useEffect(() => {
    if (
      user?.role === "DOCTOR" &&
      user.doctorProfile &&
      !selectedDoctorId &&
      !doctorId
    ) {
      setSelectedDoctorId(user.doctorProfile.id);
    }
  }, [user, doctorId, selectedDoctorId]);

  const selectedDoctor = doctors.find(
    (d) => d.id === (selectedDoctorId || doctorId)
  );

  return (
    <div className="space-y-8 p-6 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-100 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          {patientId
            ? "Patient Appointments"
            : selectedDoctor
            ? `Dr. ${selectedDoctor?.user.firstName} ${selectedDoctor?.user.lastName}'s Calendar`
            : "Appointment Calendar"}
        </h1>

        {!doctorId && !patientId && user?.role === "PATIENT" && (
          <div className="w-full sm:w-80">
            <Label
              htmlFor="doctor-select"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Select Doctor
            </Label>
            <Select
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg shadow-lg">
                <SelectItem
                  value="select-doctor"
                  className="text-gray-500 dark:text-gray-400"
                >
                  Выберите доктора
                </SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem
                    key={doctor.id}
                    value={doctor.id}
                    className="py-3 px-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <span className="font-medium">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </span>
                    {doctor.specialization && (
                      <span className="ml-1 text-sm text-blue-600 dark:text-blue-400">
                        - {doctor.specialization}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
        <Calendar
          doctorId={selectedDoctorId || doctorId || undefined}
          patientId={patientId || undefined}
        />
      </div>
    </div>
  );
}
