"use client";

import { useState } from "react";
import { Appointment, MedicalRecord } from "@/lib/types";
import { format } from "date-fns";

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
        title: "Missing information",
        description: "Please provide the medical notes.",
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
        title: "Medical record saved",
        description: "The medical record has been saved successfully.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to save medical record",
        description:
          error.message || "An error occurred while saving the medical record.",
        variant: "destructive",
      });
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {appointment.medicalRecord
              ? "Edit Medical Record"
              : "Add Medical Record"}
          </DialogTitle>
          <DialogDescription>
            {appointment.patient?.user && (
              <span>
                Patient: {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </span>
            )}
            <span className="block">
              Date: {format(new Date(appointment.startTime), "MMMM d, yyyy")}
            </span>
            <span className="block">
              Time: {format(new Date(appointment.startTime), "h:mm a")} -{" "}
              {format(new Date(appointment.endTime), "h:mm a")}
            </span>
          </DialogDescription>
        </DialogHeader>

        {appointment.symptoms && (
          <div className="mb-4">
            <Label htmlFor="symptoms">
              Patient Symptoms / Reason for Visit
            </Label>
            <div
              id="symptoms"
              className="mt-1 p-3 border rounded-md bg-muted/50 text-sm"
            >
              {appointment.symptoms}
            </div>
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="doctorNotes" className="mb-1 block">
            Doctor Notes (analysis, complaints, conclusions)
          </Label>
          <Textarea
            id="doctorNotes"
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={8}
            placeholder="Enter your medical notes, including analysis, patient complaints, and conclusions..."
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={completeAppointment.isLoading}
          >
            {completeAppointment.isLoading
              ? "Saving..."
              : "Save Medical Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
