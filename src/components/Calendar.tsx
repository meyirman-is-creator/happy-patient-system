"use client";

import { useState } from "react";
import {
  addDays,
  format,
  startOfDay,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  isEqual,
  addMinutes,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
} from "@/lib/hooks/useQueries";
import type { Appointment, AppointmentFormData } from "@/lib/types";
import { AppointmentQueryParams, ErrorResponse } from "@/lib/types.d";
import { AppointmentStatus } from "@prisma/client";

interface CalendarProps {
  doctorId?: string;
  patientId?: string;
}

export function Calendar({ doctorId, patientId }: CalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<Appointment | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({
    doctorId: doctorId || "",
    duration: 30,
    title: "",
    symptoms: "",
  });

  const startHour = 7;
  const endHour = 22;

  const timeSlots = Array.from(
    { length: (endHour - startHour) * 2 },
    (_, i) => {
      const hour = Math.floor(i / 2) + startHour;
      const minutes = (i % 2) * 30;
      return setMinutes(setHours(startOfDay(new Date()), hour), minutes);
    }
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const query: AppointmentQueryParams = {};
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  query.startDate = format(startDate, "yyyy-MM-dd");
  query.endDate = format(addDays(startDate, 7), "yyyy-MM-dd");

  const { data: appointments = [], isLoading } = useAppointments(query);
  const createAppointment = useCreateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const handlePreviousWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const handleSlotClick = (
    day: Date,
    time: Date,
    existingAppointment?: Appointment
  ) => {
    const slotDate = new Date(day);
    slotDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (existingAppointment) {
      setSelectedSlot(existingAppointment);
      setShowDetailsDialog(true);
      return;
    }

    if (isBefore(slotDate, new Date())) {
      toast({
        title: "Нельзя выбрать прошедшую дату",
        description: "Пожалуйста, выберите будущую дату.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSlot(null);
    setFormData({
      ...formData,
      startTime: slotDate,
      duration: 30,
      title: "",
      symptoms: "",
    });
    setShowBookingDialog(true);
  };

  const handleSubmitBooking = async () => {
    try {
      if (!formData.startTime || !formData.duration) {
        toast({
          title: "Отсутствует информация",
          description: "Пожалуйста, заполните все необходимые поля.",
          variant: "destructive",
        });
        return;
      }

      await createAppointment.mutateAsync({
        doctorId: formData.doctorId || doctorId,
        startTime: formData.startTime.toISOString(),
        duration: formData.duration,
        title: formData.title,
        symptoms: formData.symptoms,
      });

      toast({
        title: "Запись создана",
        description: "Ваша запись успешно создана.",
      });

      setShowBookingDialog(false);
    } catch (error) {
      const err = error as ErrorResponse;
      toast({
        title: "Ошибка создания записи",
        description: err.message || "Произошла ошибка при создании записи.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedSlot) return;

    try {
      await deleteAppointment.mutateAsync(selectedSlot.id);

      toast({
        title: "Запись отменена",
        description: "Ваша запись успешно отменена.",
      });

      setShowDetailsDialog(false);
    } catch (error) {
      const err = error as ErrorResponse;
      toast({
        title: "Ошибка отмены записи",
        description: err.message || "Произошла ошибка при отмене записи.",
        variant: "destructive",
      });
    }
  };

  const getSlotAppointment = (day: Date, time: Date) => {
    return appointments.find((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      const slotStart = new Date(day);
      slotStart.setHours(time.getHours(), time.getMinutes(), 0, 0);

      const slotEnd = addMinutes(slotStart, 30);

      return (
        (isEqual(appointmentDate, slotStart) ||
          isAfter(appointmentDate, slotStart)) &&
        isBefore(appointmentDate, slotEnd)
      );
    });
  };

  const getSlotClass = (day: Date, time: Date) => {
    const now = new Date();
    const slotDate = new Date(day);
    slotDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (isBefore(slotDate, now)) {
      return "h-16 px-2 py-1 border rounded-md cursor-not-allowed bg-[#F8FAFC] opacity-40";
    }

    const appointment = getSlotAppointment(day, time);

    if (!appointment) {
      return "h-16 px-2 py-1 border-2 border-dashed border-[#0A6EFF]/20 rounded-md cursor-pointer hover:bg-[#0A6EFF]/5 transition-colors";
    }

    if (appointment.status === AppointmentStatus.OCCUPIED) {
      return "h-16 px-2 py-1 border-2 border-green-500 bg-green-50 rounded-md cursor-pointer transition-colors";
    }

    if (appointment.status === AppointmentStatus.BOOKED) {
      if (user?.role === "PATIENT" && appointment.patientId) {
        return "h-16 px-2 py-1 border-2 border-[#0A6EFF] bg-[#0A6EFF]/10 rounded-md cursor-pointer hover:shadow-md transition-all";
      }
      return "h-16 px-2 py-1 border-2 border-[#0A6EFF]/70 bg-[#0A6EFF]/5 rounded-md cursor-pointer hover:shadow-md transition-all";
    }

    return "h-16 px-2 py-1 border-2 border-dashed border-[#0A6EFF]/20 rounded-md cursor-pointer hover:bg-[#0A6EFF]/5 transition-colors";
  };

  const formatSlotTime = (time: Date) => {
    return format(time, "HH:mm");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#0A6EFF]">
        <div className="animate-pulse">Загрузка календаря...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#0A6EFF]/10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-[#243352] flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-[#0A6EFF]" />
          {format(startDate, "d MMMM", { locale: ru })} -{" "}
          {format(addDays(startDate, 6), "d MMMM yyyy", { locale: ru })}
        </h2>
        <div className="flex space-x-3">
          <Button
            size="sm"
            onClick={handlePreviousWeek}
            className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1">Назад</span>
          </Button>
          <Button
            size="sm"
            onClick={handleNextWeek}
            className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
          >
            <span className="mr-1">Вперед</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          <div className="calendar-time-column">
            <div className="h-10"></div>
            {timeSlots.map((time, i) => (
              <div
                key={i}
                className="h-16 flex items-center justify-end pr-2 text-sm text-[#0A6EFF] font-medium"
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatSlotTime(time)}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="calendar-day">
              <div className="h-10 flex flex-col items-center justify-center font-medium bg-[#0A6EFF]/5 rounded-t-lg">
                <div className="text-sm text-[#243352]">
                  {format(day, "EEEEEE", { locale: ru })}
                </div>
                <div className="text-xs text-[#243352]/70">
                  {format(day, "d MMM", { locale: ru })}
                </div>
              </div>

              {timeSlots.map((time, timeIndex) => {
                const appointment = getSlotAppointment(day, time);
                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className={getSlotClass(day, time)}
                    onClick={() => handleSlotClick(day, time, appointment)}
                  >
                    {appointment && (
                      <>
                        <div className="text-xs truncate font-medium text-[#243352]">
                          {appointment.title || "Прием"}
                        </div>
                        {appointment.patientId && user?.role !== "PATIENT" && (
                          <div className="text-xs truncate text-[#243352]/70 flex items-center mt-1">
                            <Users className="h-3 w-3 mr-1 text-[#0A6EFF]" />
                            {appointment.patient?.user.lastName}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#243352]">
              Запись на прием
            </DialogTitle>
            <DialogDescription className="text-[#243352]/70">
              Заполните данные для записи на прием.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#243352] font-medium">
                  Дата
                </Label>
                <Input
                  id="date"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "d MMMM yyyy", {
                          locale: ru,
                        })
                      : ""
                  }
                  disabled
                  className="bg-[#F8FAFC] border-2 border-[#0A6EFF]/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-[#243352] font-medium">
                  Время
                </Label>
                <Input
                  id="time"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "HH:mm")
                      : ""
                  }
                  disabled
                  className="bg-[#F8FAFC] border-2 border-[#0A6EFF]/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[#243352] font-medium">
                Продолжительность
              </Label>
              <Select
                value={formData.duration?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: parseInt(value) })
                }
              >
                <SelectTrigger className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]">
                  <SelectValue placeholder="Выберите продолжительность" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#0A6EFF]/10">
                  <SelectItem value="30" className="hover:bg-[#0A6EFF]/5">
                    30 минут
                  </SelectItem>
                  <SelectItem value="60" className="hover:bg-[#0A6EFF]/5">
                    1 час
                  </SelectItem>
                  <SelectItem value="90" className="hover:bg-[#0A6EFF]/5">
                    1 час 30 минут
                  </SelectItem>
                  <SelectItem value="120" className="hover:bg-[#0A6EFF]/5">
                    2 часа
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#243352] font-medium">
                Название приема
              </Label>
              <Input
                id="title"
                placeholder="Например: Плановый осмотр"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-[#243352] font-medium">
                Симптомы / Причина посещения
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Опишите симптомы или причину визита..."
                rows={3}
                value={formData.symptoms || ""}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
              className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={createAppointment.isLoading}
              className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white disabled:opacity-70"
            >
              {createAppointment.isLoading ? "Создание..." : "Записаться"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSlot && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#243352]">
                Детали записи
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#243352]/70">
                    Дата
                  </h3>
                  <p className="text-[#243352] font-medium">
                    {format(new Date(selectedSlot.startTime), "d MMMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#243352]/70">
                    Время
                  </h3>
                  <p className="text-[#243352] font-medium">
                    {format(new Date(selectedSlot.startTime), "HH:mm")} -{" "}
                    {format(new Date(selectedSlot.endTime), "HH:mm")}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0A6EFF]/5 rounded-lg">
                <h3 className="text-sm font-medium text-[#243352]/70 mb-1">
                  Название
                </h3>
                <p className="text-[#243352]">
                  {selectedSlot.title || "Не указано"}
                </p>
              </div>

              {selectedSlot.symptoms && (
                <div className="p-3 bg-[#0A6EFF]/5 rounded-lg">
                  <h3 className="text-sm font-medium text-[#243352]/70 mb-1">
                    Симптомы / Причина
                  </h3>
                  <p className="whitespace-pre-wrap text-[#243352]">
                    {selectedSlot.symptoms}
                  </p>
                </div>
              )}

              {selectedSlot.medicalRecord?.doctorNotes && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-sm font-medium text-[#243352]/70 mb-1">
                    Записи врача
                  </h3>
                  <p className="whitespace-pre-wrap text-[#243352]">
                    {selectedSlot.medicalRecord.doctorNotes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 mt-2">
              {selectedSlot.status === AppointmentStatus.BOOKED &&
                user?.role === "PATIENT" && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={deleteAppointment.isLoading}
                    className="bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-70"
                  >
                    {deleteAppointment.isLoading
                      ? "Отмена..."
                      : "Отменить запись"}
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
                className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
              >
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
