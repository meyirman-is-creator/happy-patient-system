// src/components/MedicalRecordForm.tsx
"use client";

import { useState } from "react";
import { Appointment } from "@/lib/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  FileText,
  UserCircle,
  Calendar,
  Clock,
  Stethoscope,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCompleteAppointment } from "@/lib/hooks/useQueries";

interface MedicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patientId?: string;
}

export function MedicalRecordForm({
  isOpen,
  onClose,
  appointment,
  patientId,
}: MedicalRecordFormProps) {
  const { toast } = useToast();
  const [doctorNotes, setDoctorNotes] = useState(
    appointment?.medicalRecord?.doctorNotes || ""
  );

  const completeAppointment = useCompleteAppointment();

  const handleSubmit = async () => {
    if (!appointment || !doctorNotes.trim()) {
      toast({
        title: "Отсутствует информация",
        description: "Пожалуйста, введите заключение врача.",
        variant: "destructive",
      });
      return;
    }

    try {
      await completeAppointment.mutateAsync({
        id: appointment.id,
        data: { doctorNotes },
      });

      toast({
        title: "Медицинская запись сохранена",
        description: "Медицинская запись была успешно сохранена.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Произошла ошибка при сохранении записи.",
        variant: "destructive",
      });
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#243352] flex items-center">
            <FileText className="h-6 w-6 mr-2 text-[#0A6EFF]" />
            {appointment.medicalRecord
              ? "Редактирование медицинской записи"
              : "Новая медицинская запись"}
          </DialogTitle>
          <DialogDescription className="text-[#243352]/70">
            Заполните информацию о медицинском осмотре
          </DialogDescription>
        </DialogHeader>

        {/* Patient info moved outside DialogDescription to avoid nesting issues */}
        {appointment.patient?.user && (
          <div className="mt-2 mb-4">
            <div className="flex items-center text-[#0A6EFF] font-medium text-lg">
              <UserCircle className="h-5 w-5 mr-2" />
              <span>
                Пациент: {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 mb-4">
          <span className="text-sm bg-[#0A6EFF]/5 px-3 py-1 rounded-full inline-flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-[#0A6EFF]" />
            {format(new Date(appointment.startTime), "d MMMM yyyy", {
              locale: ru,
            })}
          </span>
          <span className="text-sm bg-[#0A6EFF]/5 px-3 py-1 rounded-full inline-flex items-center">
            <Clock className="h-4 w-4 mr-2 text-[#0A6EFF]" />
            {format(new Date(appointment.startTime), "HH:mm")} -{" "}
            {format(new Date(appointment.endTime), "HH:mm")}
          </span>
          {appointment.doctor?.specialization && (
            <span className="text-sm bg-[#0A6EFF]/5 px-3 py-1 rounded-full inline-flex items-center">
              <Stethoscope className="h-4 w-4 mr-2 text-[#0A6EFF]" />
              {appointment.doctor.specialization}
            </span>
          )}
        </div>

        {appointment.symptoms && (
          <div className="mb-4">
            <Label
              htmlFor="symptoms"
              className="text-sm font-medium text-[#243352] mb-2 block"
            >
              Жалобы пациента / Причина визита
            </Label>
            <div
              id="symptoms"
              className="mt-1 p-4 border-2 border-[#0A6EFF]/10 rounded-lg bg-[#0A6EFF]/5 text-[#243352] whitespace-pre-wrap"
            >
              {appointment.symptoms}
            </div>
          </div>
        )}

        <div className="mb-4">
          <Label
            htmlFor="doctorNotes"
            className="text-sm font-medium text-[#243352] mb-2 block"
          >
            Заключение врача (анализ, диагноз, рекомендации)
          </Label>
          <Textarea
            id="doctorNotes"
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={8}
            placeholder="Введите ваше заключение, включая анализ состояния пациента, диагноз и рекомендации..."
            className="resize-none border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
          />
        </div>

        <DialogFooter className="gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={completeAppointment.isLoading}
            className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white disabled:opacity-70"
          >
            {completeAppointment.isLoading
              ? "Сохранение..."
              : "Сохранить запись"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
