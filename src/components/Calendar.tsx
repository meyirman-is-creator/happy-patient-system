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

  // Start time is 7:00 AM, end time is 10:00 PM
  const startHour = 7;
  const endHour = 22;

  // Generate time slots for the week
  const timeSlots = Array.from(
    { length: (endHour - startHour) * 2 },
    (_, i) => {
      const hour = Math.floor(i / 2) + startHour;
      const minutes = (i % 2) * 30;
      return setMinutes(setHours(startOfDay(new Date()), hour), minutes);
    }
  );

  // Generate days for the week
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Fetch appointments
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

    // If there's an existing appointment, show details
    if (existingAppointment) {
      setSelectedSlot(existingAppointment);
      setShowDetailsDialog(true);
      return;
    }

    // Cannot book past slots
    if (isBefore(slotDate, new Date())) {
      toast({
        title: "Cannot book past time slots",
        description: "Please select a future time slot.",
        variant: "destructive",
      });
      return;
    }

    // Create new appointment
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

      // Create a new appointment
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

      // Check if appointment overlaps with this slot
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

    // Past slots are disabled
    if (isBefore(slotDate, now)) {
      return "calendar-slot calendar-slot-booked opacity-50";
    }

    const appointment = getSlotAppointment(day, time);

    if (!appointment) {
      return "calendar-slot calendar-slot-free";
    }

    if (appointment.status === AppointmentStatus.OCCUPIED) {
      return "calendar-slot calendar-slot-occupied";
    }

    if (appointment.status === AppointmentStatus.BOOKED) {
      // If this is the user's own booking (as a patient)
      if (user?.role === "PATIENT" && appointment.patientId) {
        return "calendar-slot calendar-slot-own-booking";
      }
      return "calendar-slot calendar-slot-booked";
    }

    return "calendar-slot calendar-slot-free";
  };

  const formatSlotTime = (time: Date) => {
    return format(time, "h:mm a");
  };

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="bg-background p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(startDate, "MMMM d, yyyy")} -{" "}
          {format(addDays(startDate, 6), "MMMM d, yyyy")}
        </h2>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button size="sm" onClick={handleNextWeek}>
            <span className="sr-only">Next Week</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="calendar-container overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          {/* Time column */}
          <div className="calendar-time-column">
            <div className="h-10"></div> {/* Empty cell for day headers */}
            {timeSlots.map((time, i) => (
              <div
                key={i}
                className="calendar-time-slot h-16 flex items-center justify-end pr-2 text-sm text-muted-foreground"
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatSlotTime(time)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="calendar-day">
              <div className="h-10 flex flex-col items-center justify-center font-medium">
                <div className="text-sm">{format(day, "EEE")}</div>
                <div className="text-xs text-muted-foreground">
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
                      <div className="text-xs truncate font-medium">
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

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book an Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details below to book your appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "MMMM d, yyyy")
                      : ""
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={
                    formData.startTime
                      ? format(formData.startTime, "h:mm a")
                      : ""
                  }
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1 hour 30 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title</Label>
              <Input
                id="title"
                placeholder="e.g., Regular checkup"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
              <Textarea
                id="symptoms"
                placeholder="Please describe your symptoms or reason for the visit..."
                rows={3}
                value={formData.symptoms || ""}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={createAppointment.isLoading}
            >
              {createAppointment.isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      {selectedSlot && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date
                  </h3>
                  <p>
                    {format(new Date(selectedSlot.startTime), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Time
                  </h3>
                  <p>
                    {format(new Date(selectedSlot.startTime), "h:mm a")} -{" "}
                    {format(new Date(selectedSlot.endTime), "h:mm a")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Title
                </h3>
                <p>{selectedSlot.title || "Not specified"}</p>
              </div>

              {selectedSlot.symptoms && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Symptoms / Reason
                  </h3>
                  <p className="whitespace-pre-wrap">{selectedSlot.symptoms}</p>
                </div>
              )}

              {selectedSlot.medicalRecord?.doctorNotes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Doctor Notes
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {selectedSlot.medicalRecord.doctorNotes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedSlot.status === AppointmentStatus.BOOKED &&
                user?.role === "PATIENT" && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={deleteAppointment.isLoading}
                  >
                    {deleteAppointment.isLoading
                      ? "Cancelling..."
                      : "Cancel Appointment"}
                  </Button>
                )}
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
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
