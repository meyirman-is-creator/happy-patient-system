// src/app/listing/page.tsx
"use client";

import { useState } from "react";
import { UserPlus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface DoctorFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  education: string;
}

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
  const [doctorFormData, setDoctorFormData] = useState<DoctorFormData>({
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
      console.log("Deleting doctor with ID:", doctorId);
      await deleteDoctor.mutateAsync(doctorId);
      toast({
        title: "Врач удален",
        description: "Врач был успешно удален из системы.",
      });
    } catch (error) {
      console.error("Delete doctor error:", error);
      toast({
        title: "Ошибка удаления",
        description:
          "Произошла ошибка при удалении врача. Возможно, у врача есть записи на прием.",
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
        // For updating an existing doctor
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
          title: "Врач обновлен",
          description: "Информация о враче была успешно обновлена.",
        });
      } else {
        // For creating a new doctor
        if (!doctorFormData.password) {
          toast({
            title: "Отсутствует пароль",
            description:
              "Пожалуйста, укажите пароль для нового аккаунта врача.",
            variant: "destructive",
          });
          return;
        }

        await createDoctor.mutateAsync({
          email: doctorFormData.email,
          password: doctorFormData.password,
          firstName: doctorFormData.firstName,
          lastName: doctorFormData.lastName,
          phone: doctorFormData.phone,
          specialization: doctorFormData.specialization,
          education: doctorFormData.education,
        });

        toast({
          title: "Врач добавлен",
          description: "Новый врач был успешно добавлен в систему.",
        });
      }

      setShowDoctorDialog(false);
    } catch (error) {
      console.error("Doctor operation error:", error);
      toast({
        title: "Ошибка операции",
        description: "Произошла ошибка при обработке данных врача.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAttended = async (appointmentId: string) => {
    try {
      await confirmAppointment.mutateAsync(appointmentId);
      toast({
        title: "Прием подтвержден",
        description: "Отмечено присутствие пациента.",
      });
    } catch {
      toast({
        title: "Ошибка подтверждения",
        description: "Произошла ошибка.",
        variant: "destructive",
      });
    }
  };

  const handleMarkMissed = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync(appointmentId);
      toast({
        title: "Прием отменен",
        description: "Отмечено отсутствие пациента.",
      });
    } catch {
      toast({
        title: "Ошибка отметки",
        description: "Произошла ошибка.",
        variant: "destructive",
      });
    }
  };

  const handleAddMedicalRecord = (appointmentId: string) => {
    const appointment = appointments.find((app) => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowMedicalRecordForm(true);
    }
  };

  return (
    <div className="ml-[20px] mt-[20px]">
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#0A6EFF]/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0A6EFF]/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#243352]">
              {user?.role === "PATIENT"
                ? "Справочник врачей"
                : user?.role === "DOCTOR"
                ? "Мои пациенты"
                : "Управление врачами"}
            </h1>
            {user?.role === "PATIENT" && (
              <p className="text-[#243352]/70 mt-1">
                Всего врачей:{" "}
                <span className="font-medium">{doctors.length}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#0A6EFF]" />
              <Input
                type="search"
                placeholder="Поиск..."
                className="pl-10 h-12 border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-3 text-[#243352]/60 hover:text-[#243352]"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {user?.role === "ADMIN" && (
              <Button
                onClick={handleAddNewDoctor}
                className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white h-12 px-5 rounded-lg shadow-sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить врача
              </Button>
            )}
          </div>
        </div>

        {user?.role === "DOCTOR" ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#0A6EFF]/10 p-6 mt-6">
            <PatientList
              appointments={appointments}
              isLoading={loadingAppointments}
              onMarkAttended={handleMarkAttended}
              onMarkMissed={handleMarkMissed}
              onAddNotes={handleAddMedicalRecord}
            />
          </div>
        ) : (
          <div className="mt-6">
            {loadingDoctors ? (
              <div className="flex justify-center py-12 text-[#0A6EFF]">
                <div className="animate-pulse">Загрузка данных врачей...</div>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#0A6EFF]/10">
                <p className="text-[#243352]/70">Врачи не найдены</p>
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
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Dialog */}
      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#243352]">
              {editingDoctor ? "Редактировать врача" : "Добавить нового врача"}
            </DialogTitle>
            <DialogDescription className="text-[#243352]/70">
              {editingDoctor
                ? "Обновите информацию о враче."
                : "Заполните данные для добавления нового врача в систему."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-[#243352] font-medium"
                >
                  Имя
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
                  className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-[#243352] font-medium"
                >
                  Фамилия
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
                  className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#243352] font-medium">
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
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] disabled:opacity-70 disabled:bg-[#F8FAFC]"
              />
            </div>

            {!editingDoctor && (
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[#243352] font-medium"
                >
                  Пароль
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
                  className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#243352] font-medium">
                Телефон
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
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="specialization"
                className="text-[#243352] font-medium"
              >
                Специализация
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
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education" className="text-[#243352] font-medium">
                Образование и квалификация
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
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDoctorDialog(false)}
              className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitDoctorForm}
              disabled={createDoctor.isPending || updateDoctor.isPending}
              className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white disabled:opacity-70"
            >
              {editingDoctor ? "Обновить данные" : "Добавить врача"}
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
