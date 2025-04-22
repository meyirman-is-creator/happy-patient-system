"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { DoctorCard } from "@/components/DoctorCard";
import { PatientList } from "@/components/PatientList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicalRecordForm } from "@/components/MedicalRecordForm";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  useAppointments,
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
  useConfirmAppointment,
  useCancelAppointment,
} from "@/lib/hooks/useQueries";
import { Doctor, Appointment } from "@/lib/types";

export default function ListingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();
  const { data: appointments = [], isLoading: loadingAppointments } =
    useAppointments();

  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();
  const confirmAppointment = useConfirmAppointment();
  const cancelAppointment = useCancelAppointment();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorFormData, setDoctorFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    specialization: "",
    education: "",
  });

  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Filter doctors by search query
  const filteredDoctors = doctors.filter((doctor) => {
    const fullName =
      `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
    const specialization = doctor.specialization?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || specialization.includes(query);
  });

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorFormData({
      email: doctor.user.email,
      password: "",
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      phone: doctor.user.phone,
      specialization: doctor.specialization || "",
      education: doctor.education || "",
    });
    setShowDoctorDialog(true);
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      await deleteDoctor.mutateAsync(doctorId);
      toast({
        title: "Doctor deleted",
        description: "The doctor has been removed from the system.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete doctor",
        description: error.message || "An error occurred during deletion.",
        variant: "destructive",
      });
    }
  };

  const handleAddNewDoctor = () => {
    setEditingDoctor(null);
    setDoctorFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      specialization: "",
      education: "",
    });
    setShowDoctorDialog(true);
  };

  const handleSubmitDoctorForm = async () => {
    try {
      if (editingDoctor) {
        // Update existing doctor
        await updateDoctor.mutateAsync({
          id: editingDoctor.id,
          data: {
            firstName: doctorFormData.firstName,
            lastName: doctorFormData.lastName,
            phone: doctorFormData.phone,
            specialization: doctorFormData.specialization,
            education: doctorFormData.education,
          },
        });

        toast({
          title: "Doctor updated",
          description: "The doctor information has been updated.",
        });
      } else {
        // Create new doctor
        if (!doctorFormData.password) {
          toast({
            title: "Missing password",
            description:
              "Please provide a password for the new doctor account.",
            variant: "destructive",
          });
          return;
        }

        await createDoctor.mutateAsync(doctorFormData);

        toast({
          title: "Doctor created",
          description: "The new doctor has been added to the system.",
        });
      }

      setShowDoctorDialog(false);
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAttended = async (appointmentId: string) => {
    try {
      await confirmAppointment.mutateAsync(appointmentId);
      toast({
        title: "Appointment confirmed",
        description: "The patient has been marked as attended.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to confirm attendance",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleMarkMissed = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      toast({
        title: "Appointment cancelled",
        description: "The patient has been marked as no-show.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to mark as no-show",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAddMedicalRecord = (appointmentId: string, patientId: string) => {
    const appointment = appointments.find((app) => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowMedicalRecordForm(true);
    }
  };

  // Default tab based on user role
  const defaultTab =
    user?.role === "PATIENT"
      ? "doctors"
      : user?.role === "DOCTOR"
      ? "patients"
      : "doctors";

  return (
    <div className="p-6 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-100 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300">
          {user?.role === "PATIENT"
            ? "Doctors Directory"
            : user?.role === "DOCTOR"
            ? "My Patients"
            : "Manage Users"}
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500 dark:text-blue-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 h-12 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {user?.role === "ADMIN" && (
            <Button
              onClick={handleAddNewDoctor}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 h-12 px-5 rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          )}
        </div>
      </div>

      {user?.role === "ADMIN" ? (
        <Tabs defaultValue={defaultTab} className="mt-6">
          <TabsList className="bg-blue-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger
              value="doctors"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md px-6 py-2 transition-all"
            >
              Doctors
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md px-6 py-2 transition-all"
            >
              Patients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-6">
            {loadingDoctors ? (
              <div className="flex justify-center py-12 text-blue-700 dark:text-blue-300">
                <div className="animate-pulse">Loading doctors...</div>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-md">
                <p className="text-gray-500 dark:text-gray-400">
                  No doctors found
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isAdmin={user?.role === "ADMIN"}
                    onEdit={handleEditDoctor}
                    onDelete={handleDeleteDoctor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="patients" className="mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
              <PatientList
                appointments={appointments}
                isLoading={loadingAppointments}
                onMarkAttended={handleMarkAttended}
                onMarkMissed={handleMarkMissed}
                onAddNotes={handleAddMedicalRecord}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : user?.role === "DOCTOR" ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 mt-6">
          <PatientList
            appointments={appointments}
            isLoading={loadingAppointments}
            onMarkAttended={handleMarkAttended}
            onMarkMissed={handleMarkMissed}
            onAddNotes={handleAddMedicalRecord}
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {loadingDoctors ? (
            <div className="col-span-full flex justify-center py-12 text-blue-700 dark:text-blue-300">
              <div className="animate-pulse">Loading doctors...</div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 col-span-full bg-white dark:bg-gray-900 rounded-xl shadow-md">
              <p className="text-gray-500 dark:text-gray-400">
                No doctors found
              </p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          )}
        </div>
      )}

      {/* Add/Edit Doctor Dialog */}
      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {editingDoctor
                ? "Update the doctor's information below."
                : "Fill in the details to add a new doctor to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={doctorFormData.firstName}
                  onChange={(e) =>
                    setDoctorFormData({
                      ...doctorFormData,
                      firstName: e.target.value,
                    })
                  }
                  className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={doctorFormData.lastName}
                  onChange={(e) =>
                    setDoctorFormData({
                      ...doctorFormData,
                      lastName: e.target.value,
                    })
                  }
                  className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={doctorFormData.email}
                onChange={(e) =>
                  setDoctorFormData({
                    ...doctorFormData,
                    email: e.target.value,
                  })
                }
                disabled={!!editingDoctor}
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            {!editingDoctor && (
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={doctorFormData.password}
                  onChange={(e) =>
                    setDoctorFormData({
                      ...doctorFormData,
                      password: e.target.value,
                    })
                  }
                  className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </Label>
              <Input
                id="phone"
                value={doctorFormData.phone}
                onChange={(e) =>
                  setDoctorFormData({
                    ...doctorFormData,
                    phone: e.target.value,
                  })
                }
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="specialization"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Specialization
              </Label>
              <Input
                id="specialization"
                value={doctorFormData.specialization}
                onChange={(e) =>
                  setDoctorFormData({
                    ...doctorFormData,
                    specialization: e.target.value,
                  })
                }
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="education"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Education & Qualifications
              </Label>
              <Textarea
                id="education"
                value={doctorFormData.education}
                onChange={(e) =>
                  setDoctorFormData({
                    ...doctorFormData,
                    education: e.target.value,
                  })
                }
                rows={3}
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDoctorDialog(false)}
              className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDoctorForm}
              disabled={createDoctor.isLoading || updateDoctor.isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {editingDoctor ? "Update Doctor" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical Record Form */}
      <MedicalRecordForm
        isOpen={showMedicalRecordForm}
        onClose={() => setShowMedicalRecordForm(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}
