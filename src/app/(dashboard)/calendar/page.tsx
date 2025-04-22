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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">
          {patientId
            ? "Patient Appointments"
            : doctorId && doctors.find((d) => d.id === doctorId)
            ? `Dr. ${doctors.find((d) => d.id === doctorId)?.user.firstName} ${
                doctors.find((d) => d.id === doctorId)?.user.lastName
              }'s Calendar`
            : "Appointment Calendar"}
        </h1>

        {!doctorId && !patientId && user?.role === "PATIENT" && (
          <div className="w-full sm:w-72">
            <Label htmlFor="doctor-select" className="mb-1 block">
              Select Doctor
            </Label>
            <Select
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="select-doctor">Выберите доктора</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                    {doctor.specialization && ` - ${doctor.specialization}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Calendar
        doctorId={selectedDoctorId || doctorId || undefined}
        patientId={patientId || undefined}
      />
    </div>
  );
}
