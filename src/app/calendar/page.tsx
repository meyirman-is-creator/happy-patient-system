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
import { Stethoscope, Users, Calendar as CalendarIcon } from "lucide-react";

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
    <div className="ml-0 lg:ml-64 p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#0A6EFF]/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#0A6EFF]/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#243352] flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-[#0A6EFF]" />
              {patientId
                ? "Записи пациента"
                : selectedDoctor
                ? `Расписание: ${selectedDoctor?.user.firstName} ${selectedDoctor?.user.lastName}`
                : "Календарь приемов"}
            </h1>
            {selectedDoctor && selectedDoctor.specialization && (
              <p className="mt-1 text-[#0A6EFF]">
                <Stethoscope className="h-4 w-4 inline mr-1" />
                {selectedDoctor.specialization}
              </p>
            )}
          </div>

          {!doctorId && !patientId && user?.role === "PATIENT" && (
            <div className="w-full sm:w-80">
              <Label
                htmlFor="doctor-select"
                className="mb-2 block text-sm font-medium text-[#243352]"
              >
                Выберите врача
              </Label>
              <Select
                value={selectedDoctorId}
                onValueChange={setSelectedDoctorId}
              >
                <SelectTrigger className="bg-white border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] h-12 rounded-lg">
                  <SelectValue placeholder="Выберите врача" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#0A6EFF]/10 rounded-lg shadow-lg">
                  <SelectItem
                    value="select-doctor"
                    className="text-[#243352]/70"
                  >
                    Выберите врача
                  </SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem
                      key={doctor.id}
                      value={doctor.id}
                      className="py-3 px-2 hover:bg-[#0A6EFF]/5 rounded-md transition-colors"
                    >
                      <span className="font-medium">
                        Др. {doctor.user.firstName} {doctor.user.lastName}
                      </span>
                      {doctor.specialization && (
                        <span className="ml-1 text-sm text-[#0A6EFF]">
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

        <div className="mt-6">
          <Calendar
            doctorId={selectedDoctorId || doctorId || undefined}
            patientId={patientId || undefined}
          />
        </div>
      </div>
    </div>
  );
}
