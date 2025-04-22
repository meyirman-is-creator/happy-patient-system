"use client";

import { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

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
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/lib/hooks/useQueries";
import type { Appointment, AppointmentFormData } from "@/lib/types";
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

  const query: any = {};
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  query.startDate = format(startDate, "yyyy-MM-dd");
  query.endDate = format(addDays(startDate, 7), "yyyy-MM-dd");

  const { data: appointments = [], isLoading } = useAppointments(query);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
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
        title: "Cannot book past time slots",
        description: "Please select a future time slot.",
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
          title: "Missing information",
          description: "Please fill in all required fields.",
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
        title: "Appointment booked",
        description: "Your appointment has been successfully booked.",
      });

      setShowBookingDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to book appointment",
        description:
          error.message || "An error occurred while booking your appointment.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedSlot) return;

    try {
      await deleteAppointment.mutateAsync(selectedSlot.id);

      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled.",
      });

      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to cancel appointment",
        description:
          error.message ||
          "An error occurred while cancelling your appointment.",
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
      return "h-16 px-2 py-1 border rounded-md cursor-not-allowed bg-gray-100 dark:bg-gray-800 opacity-40";
    }

    const appointment = getSlotAppointment(day, time);

    if (!appointment) {
      return "h-16 px-2 py-1 border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors";
    }

    if (appointment.status === AppointmentStatus.OCCUPIED) {
      return "h-16 px-2 py-1 border-2 border-green-500 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-md cursor-pointer transition-colors";
    }

    if (appointment.status === AppointmentStatus.BOOKED) {
      if (user?.role === "PATIENT" && appointment.patientId) {
        return "h-16 px-2 py-1 border-2 border-blue-600 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/40 rounded-md cursor-pointer hover:shadow-md transition-all";
      }
      return "h-16 px-2 py-1 border-2 border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-md cursor-pointer hover:shadow-md transition-all";
    }

    return "h-16 px-2 py-1 border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors";
  };

  const formatSlotTime = (time: Date) => {
    return format(time, "h:mm a");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-700 dark:text-blue-300">
        <div className="animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border-2 border-blue-100 dark:border-blue-900/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300">
          {format(startDate, "MMMM d, yyyy")} -{" "}
          {format(addDays(startDate, 6), "MMMM d, yyyy")}
        </h2>
        <div className="flex space-x-3">
          <Button
            size="sm"
            onClick={handlePreviousWeek}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button
            size="sm"
            onClick={handleNextWeek}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <span className="sr-only">Next Week</span>
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
                className="h-16 flex items-center justify-end pr-2 text-sm text-blue-600 dark:text-blue-400 font-medium"
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatSlotTime(time)}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="calendar-day">
              <div className="h-10 flex flex-col items-center justify-center font-medium">
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  {format(day, "EEE")}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {format(day, "MMM d")}
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
                      <div className="text-xs truncate font-medium text-blue-700 dark:text-blue-300">
                        {appointment.title || "Appointment"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              Book an Appointment
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details below to book your appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Date
                </Label>
                <Input
                  id="date"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "MMMM d, yyyy")
                      : ""
                  }
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Time
                </Label>
                <Input
                  id="time"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "h:mm a")
                      : ""
                  }
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Duration
              </Label>
              <Select
                value={formData.duration?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: parseInt(value) })
                }
              >
                <SelectTrigger className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900">
                  <SelectItem
                    value="30"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    30 minutes
                  </SelectItem>
                  <SelectItem
                    value="60"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    1 hour
                  </SelectItem>
                  <SelectItem
                    value="90"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    1 hour 30 minutes
                  </SelectItem>
                  <SelectItem
                    value="120"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    2 hours
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Appointment Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Regular checkup"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="symptoms"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Symptoms / Reason for Visit
              </Label>
              <Textarea
                id="symptoms"
                placeholder="Please describe your symptoms or reason for the visit..."
                rows={3}
                value={formData.symptoms || ""}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
              className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={createAppointment.isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {createAppointment.isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedSlot && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                Appointment Details
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Date
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    {format(new Date(selectedSlot.startTime), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Time
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    {format(new Date(selectedSlot.startTime), "h:mm a")} -{" "}
                    {format(new Date(selectedSlot.endTime), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Title
                </h3>
                <p className="text-blue-800 dark:text-blue-300">
                  {selectedSlot.title || "Not specified"}
                </p>
              </div>

              {selectedSlot.symptoms && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Symptoms / Reason
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {selectedSlot.symptoms}
                  </p>
                </div>
              )}

              {selectedSlot.medicalRecord?.doctorNotes && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Doctor Notes
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
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
                      ? "Cancelling..."
                      : "Cancel Appointment"}
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
                className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
