import { useEffect, useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { useScheduleStore } from "@/store/schedule-store";
import { useAuthStore } from "@/store/auth-store";
import { Slot, SlotStatus } from "@/types/appointment";
import { UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ScheduleViewProps {
  doctorId: string;
  isAdmin?: boolean;
}

export function ScheduleView({ doctorId, isAdmin = false }: ScheduleViewProps) {
  const { user } = useAuthStore();
  const {
    fetchDoctorSchedule,
    bookSlot,
    cancelBooking,
    markSlotAsOccupied,
    isLoading,
    error,
  } = useScheduleStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const schedule = await fetchDoctorSchedule(
          doctorId,
          format(selectedDate, "yyyy-MM-dd")
        );

        // Filter slots for the selected date
        const dateSlots = schedule.slots.filter((slot) =>
          isSameDay(new Date(slot.date), selectedDate)
        );

        setSlots(dateSlots);
      } catch (error) {
        console.error("Failed to load schedule:", error);
      }
    };

    loadSchedule();
  }, [doctorId, selectedDate, fetchDoctorSchedule]);

  const handleBookSlot = async (slot: Slot) => {
    if (!user || user.role !== UserRole.PATIENT) {
      return;
    }

    try {
      await bookSlot(slot.id, user.id);
      setActiveDialog(null);

      // Refresh slots
      const schedule = await fetchDoctorSchedule(
        doctorId,
        format(selectedDate, "yyyy-MM-dd")
      );
      const dateSlots = schedule.slots.filter((s) =>
        isSameDay(new Date(s.date), selectedDate)
      );

      setSlots(dateSlots);
    } catch (error) {
      console.error("Failed to book slot:", error);
    }
  };

  const handleCancelBooking = async (slot: Slot) => {
    try {
      await cancelBooking(slot.id);
      setActiveDialog(null);

      // Refresh slots
      const schedule = await fetchDoctorSchedule(
        doctorId,
        format(selectedDate, "yyyy-MM-dd")
      );
      const dateSlots = schedule.slots.filter((s) =>
        isSameDay(new Date(s.date), selectedDate)
      );

      setSlots(dateSlots);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const handleMarkAsOccupied = async (slot: Slot) => {
    try {
      await markSlotAsOccupied(slot.id);
      setActiveDialog(null);

      // Refresh slots
      const schedule = await fetchDoctorSchedule(
        doctorId,
        format(selectedDate, "yyyy-MM-dd")
      );
      const dateSlots = schedule.slots.filter((s) =>
        isSameDay(new Date(s.date), selectedDate)
      );

      setSlots(dateSlots);
    } catch (error) {
      console.error("Failed to mark slot as occupied:", error);
    }
  };

  const getSlotStatusBadge = (status: SlotStatus) => {
    switch (status) {
      case SlotStatus.FREE:
        return <Badge className="bg-[#10B981]">Available</Badge>;
      case SlotStatus.BOOKED:
        return <Badge className="bg-[#F97316]">Booked</Badge>;
      case SlotStatus.OCCUPIED:
        return <Badge className="bg-[#6B7280]">Completed</Badge>;
      default:
        return null;
    }
  };

  const canBookSlot = (slot: Slot) => {
    return user?.role === UserRole.PATIENT && slot.status === SlotStatus.FREE;
  };

  const canCancelBooking = (slot: Slot) => {
    return (
      ((user?.role === UserRole.PATIENT && slot.patientId === user.id) ||
        user?.role === UserRole.ADMIN) &&
      slot.status === SlotStatus.BOOKED
    );
  };

  const canMarkAsOccupied = (slot: Slot) => {
    return user?.role === UserRole.DOCTOR && slot.status === SlotStatus.BOOKED;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#273441]">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={{ before: new Date() }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#273441]">
                Schedule for {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-100 p-4 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center p-8 text-[#51657A]">
                  <p>No available slots for this date.</p>
                  {isAdmin && (
                    <Button
                      className="mt-4 bg-[#007CFF] hover:bg-[#0070E6]"
                      onClick={() => {
                        // Redirect to create schedule page
                      }}
                    >
                      Create Schedule
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-md",
                        slot.status === SlotStatus.FREE
                          ? "hover:bg-[#F9FAFB]"
                          : "",
                        slot.status === SlotStatus.BOOKED ? "bg-[#FFF7ED]" : "",
                        slot.status === SlotStatus.OCCUPIED
                          ? "bg-[#F3F4F6]"
                          : ""
                      )}
                    >
                      <div className="text-[#273441] font-medium">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div>{getSlotStatusBadge(slot.status)}</div>
                      <div>
                        {canBookSlot(slot) && (
                          <Dialog
                            open={activeDialog === `book-${slot.id}`}
                            onOpenChange={(open) => {
                              setActiveDialog(open ? `book-${slot.id}` : null);
                              setSelectedSlot(slot);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                                Book Appointment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Appointment</DialogTitle>
                                <DialogDescription>
                                  You are about to book an appointment on{" "}
                                  {format(selectedDate, "MMMM d, yyyy")} at{" "}
                                  {slot.startTime}.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setActiveDialog(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-[#007CFF] hover:bg-[#0070E6]"
                                  onClick={() => handleBookSlot(slot)}
                                >
                                  Confirm Booking
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {canCancelBooking(slot) && (
                          <Dialog
                            open={activeDialog === `cancel-${slot.id}`}
                            onOpenChange={(open) => {
                              setActiveDialog(
                                open ? `cancel-${slot.id}` : null
                              );
                              setSelectedSlot(slot);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2]"
                              >
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Appointment</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to cancel your
                                  appointment on{" "}
                                  {format(selectedDate, "MMMM d, yyyy")} at{" "}
                                  {slot.startTime}?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setActiveDialog(null)}
                                >
                                  Keep Appointment
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleCancelBooking(slot)}
                                >
                                  Cancel Appointment
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {canMarkAsOccupied(slot) && (
                          <Dialog
                            open={activeDialog === `occupy-${slot.id}`}
                            onOpenChange={(open) => {
                              setActiveDialog(
                                open ? `occupy-${slot.id}` : null
                              );
                              setSelectedSlot(slot);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                                Mark as Completed
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Mark Appointment as Completed
                                </DialogTitle>
                                <DialogDescription>
                                  Confirm that the patient has attended this
                                  appointment on{" "}
                                  {format(selectedDate, "MMMM d, yyyy")} at{" "}
                                  {slot.startTime}.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setActiveDialog(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-[#007CFF] hover:bg-[#0070E6]"
                                  onClick={() => handleMarkAsOccupied(slot)}
                                >
                                  Mark as Completed
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
