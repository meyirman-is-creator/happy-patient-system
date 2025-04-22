"use client";

import { useState } from "react";
import { Appointment } from "@/lib/types";
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
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            {appointment.medicalRecord
              ? "Edit Medical Record"
              : "Add Medical Record"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {appointment.patient?.user && (
              <span className="block text-blue-700 dark:text-blue-300 font-medium text-lg">
                Patient: {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </span>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2">
              <span className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                Date: {format(new Date(appointment.startTime), "MMMM d, yyyy")}
              </span>
              <span className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                Time: {format(new Date(appointment.startTime), "h:mm a")} -{" "}
                {format(new Date(appointment.endTime), "h:mm a")}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {appointment.symptoms && (
          <div className="mb-4">
            <Label
              htmlFor="symptoms"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
            >
              Patient Symptoms / Reason for Visit
            </Label>
            <div
              id="symptoms"
              className="mt-1 p-4 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300"
            >
              {appointment.symptoms}
            </div>
          </div>
        )}

        <div className="mb-4">
          <Label
            htmlFor="doctorNotes"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
          >
            Doctor Notes (analysis, complaints, conclusions)
          </Label>
          <Textarea
            id="doctorNotes"
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={8}
            placeholder="Enter your medical notes, including analysis, patient complaints, and conclusions..."
            className="resize-none border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <DialogFooter className="gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={completeAppointment.isLoading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-70"
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
