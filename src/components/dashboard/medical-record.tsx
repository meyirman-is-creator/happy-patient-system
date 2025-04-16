import { useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useMedicalRecordStore } from "@/store/medical-record-store";
import { useDoctorStore } from "@/store/doctor-store";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/user";
import { MedicalRecord as MedicalRecordType } from "@/types/medical-record";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicalRecordProps {
  patientId: string;
  appointmentId?: string;
}

export function MedicalRecord({
  patientId,
  appointmentId,
}: MedicalRecordProps) {
  const { user } = useAuthStore();
  const {
    fetchPatientRecords,
    addMedicalRecord,
    patientRecords,
    isLoading,
    error,
  } = useMedicalRecordStore();
  const { doctors, fetchDoctors } = useDoctorStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    fetchPatientRecords(patientId);
    fetchDoctors();
  }, [patientId, fetchPatientRecords, fetchDoctors]);

  const records = patientRecords[patientId] || [];

  // Sort records by visit date (most recent first)
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
  });

  const handleAddRecord = async () => {
    if (!user || user.role !== UserRole.DOCTOR || !appointmentId) {
      return;
    }

    try {
      await addMedicalRecord({
        patientId,
        doctorId: user.id,
        appointmentId,
        notes: noteContent,
        visitDate: new Date().toISOString(),
      });

      setNoteContent("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add medical record:", error);
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor
      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
      : "Unknown Doctor";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#273441]">Medical Records</h2>

        {user?.role === UserRole.DOCTOR && appointmentId && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#007CFF] hover:bg-[#0070E6]">
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
                <DialogDescription>
                  Add notes for this patient visit.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="Enter patient complaints, analysis, and conclusions..."
                  className="min-h-[150px]"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#007CFF] hover:bg-[#0070E6]"
                  onClick={handleAddRecord}
                  disabled={!noteContent.trim()}
                >
                  Save Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : sortedRecords.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-[#51657A]">
            <p>No medical records found for this patient.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              doctorName={getDoctorName(record.doctorId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MedicalRecordCardProps {
  record: MedicalRecordType;
  doctorName: string;
}

function MedicalRecordCard({ record, doctorName }: MedicalRecordCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#6D8CAD]/10 pb-3">
        <CardTitle className="text-[#273441] text-lg flex justify-between">
          <span>
            Visit on {format(parseISO(record.visitDate), "MMMM d, yyyy")}
          </span>
          <span className="text-sm text-[#51657A]">
            {format(parseISO(record.visitDate), "h:mm a")}
          </span>
        </CardTitle>
        <CardDescription className="text-[#51657A]">
          Doctor: {doctorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="whitespace-pre-wrap text-[#374151]">{record.notes}</div>
      </CardContent>
    </Card>
  );
}
