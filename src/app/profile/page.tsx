"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  FileText,
  UserCircle,
  Edit,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  usePatientMedicalRecords,
  useAppointments,
  usePatient,
} from "@/lib/hooks/useQueries";
import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateUser, updatePassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const tabParam = searchParams.get("tab");

  // State for edit forms
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Get viewing mode
  const isViewingOtherPatient =
    !!patientIdParam && patientIdParam !== user?.patientProfile?.id;
  const viewPatientId = isViewingOtherPatient
    ? patientIdParam
    : user?.patientProfile?.id;

  // If we're viewing another patient's profile, fetch their data
  const { data: viewedPatient } = usePatient(viewPatientId || "");

  // Fetch medical records for patients
  const { data: medicalRecords = [], isLoading: loadingRecords } =
    usePatientMedicalRecords(viewPatientId || "");

  // Fetch appointments for the current user or viewed patient
  const appointmentParams = {
    ...(viewPatientId ? { patientId: viewPatientId } : {}),
    ...(user?.doctorProfile ? { doctorId: user.doctorProfile.id } : {}),
  };

  const { data: appointments = [], isLoading: loadingAppointments } =
    useAppointments(appointmentParams);

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const pastAppointments = sortedAppointments.filter(
    (app) => app.status === AppointmentStatus.OCCUPIED
  );

  const upcomingAppointments = sortedAppointments.filter(
    (app) => app.status === AppointmentStatus.BOOKED
  );

  // Set the default tab based on URL parameter or user role
  const defaultTab =
    tabParam ||
    (user?.role === "PATIENT" || isViewingOtherPatient
      ? "medical-records"
      : "appointments");

  const handleUpdateProfile = async () => {
    try {
      await updateUser.mutateAsync(profileFormData);

      toast({
        title: "Профиль обновлен",
        description: "Ваша информация была успешно обновлена.",
      });

      setShowProfileDialog(false);
    } catch (error: any) {
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить информацию профиля.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Пароли не совпадают",
        description: "Ваш новый пароль и подтверждение не совпадают.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePassword.mutateAsync({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });

      toast({
        title: "Пароль обновлен",
        description: "Ваш пароль был успешно изменен.",
      });

      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordDialog(false);
    } catch (error: any) {
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить пароль.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  // Determine which user to display
  const displayUser =
    isViewingOtherPatient && viewedPatient
      ? { ...viewedPatient.user, patientProfile: viewedPatient }
      : user;

  const initials =
    `${displayUser.firstName[0]}${displayUser.lastName[0]}`.toUpperCase();

  // Add this logic to determine when to show the back button
  const showBackButton = isViewingOtherPatient;

  // Add back button handler
  const handleBack = () => {
    if (user?.role === "DOCTOR") {
      router.push("/listing"); // Doctors go back to patient list
    } else {
      router.push("/"); // Others go to home
    }
  };

  return (
    <div className="ml-[20px] mt-[20px]">
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#0A6EFF]/10">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
        )}
        <h1 className="text-2xl font-bold text-[#243352] border-b border-[#0A6EFF]/10 pb-4 flex items-center">
          <UserCircle className="h-6 w-6 mr-2 text-[#0A6EFF]" />
          {isViewingOtherPatient
            ? `Профиль пациента: ${displayUser.firstName} ${displayUser.lastName}`
            : "Мой профиль"}
        </h1>

        <div className="grid gap-8 md:grid-cols-3 mt-6">
          {/* Profile Card */}
          <Card className="flex flex-col h-full border border-[#0A6EFF]/10 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4 border-b border-[#0A6EFF]/10 bg-gradient-to-r from-[#0A6EFF]/5 to-white">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-28 w-28 bg-[#0A6EFF]/10 ring-4 ring-[#0A6EFF]/20">
                  <AvatarFallback className="text-2xl font-bold text-[#0A6EFF]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle className="text-2xl text-[#243352]">
                    {displayUser.role === "DOCTOR" ? "Др. " : ""}
                    {displayUser.firstName} {displayUser.lastName}
                  </CardTitle>
                  <CardDescription className="text-[#0A6EFF] font-medium">
                    {displayUser.role === "DOCTOR"
                      ? "Врач"
                      : displayUser.role === "ADMIN"
                      ? "Администратор"
                      : "Пациент"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 mt-4">
                <div className="flex items-center gap-3 p-3 bg-[#0A6EFF]/5 rounded-lg">
                  <Mail className="h-5 w-5 text-[#0A6EFF]" />
                  <span className="text-[#243352]">{displayUser.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0A6EFF]/5 rounded-lg">
                  <Phone className="h-5 w-5 text-[#0A6EFF]" />
                  <span className="text-[#243352]">{displayUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#0A6EFF]/5 rounded-lg">
                  <User className="h-5 w-5 text-[#0A6EFF]" />
                  <span className="text-[#243352]">
                    В системе с{" "}
                    {format(new Date(displayUser.createdAt), "LLLL yyyy", {
                      locale: ru,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            {!isViewingOtherPatient && (
              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button
                  onClick={() => {
                    setProfileFormData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phone: user.phone,
                    });
                    setShowProfileDialog(true);
                  }}
                  className="w-full bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white h-11"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать профиль
                </Button>
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full bg-white text-[#243352] border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 h-11"
                  variant="outline"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Изменить пароль
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="mb-6 bg-[#0A6EFF]/5 p-1 rounded-lg w-full">
                {/* Only show medical records tab for patients or when viewing a patient */}
                {(displayUser.role === "PATIENT" || isViewingOtherPatient) && (
                  <TabsTrigger
                    value="medical-records"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#0A6EFF] data-[state=active]:shadow-sm rounded-md py-2"
                  >
                    Медицинская карта
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="appointments"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#0A6EFF] data-[state=active]:shadow-sm rounded-md py-2"
                >
                  {isViewingOtherPatient ? "Приемы пациента" : "Мои записи"}
                </TabsTrigger>
              </TabsList>

              {/* Medical Records Tab - For Patients or when viewing a patient */}
              {(displayUser.role === "PATIENT" || isViewingOtherPatient) && (
                <TabsContent value="medical-records">
                  <Card className="bg-white border border-[#0A6EFF]/10 shadow-sm">
                    <CardHeader className="border-b border-[#0A6EFF]/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-[#243352] flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-[#0A6EFF]" />
                            {isViewingOtherPatient
                              ? "Медицинская карта пациента"
                              : "История болезни"}
                          </CardTitle>
                          <CardDescription className="text-[#243352]/70">
                            {isViewingOtherPatient
                              ? `Полная история посещений и записей врачей пациента ${displayUser.firstName} ${displayUser.lastName}`
                              : "Полная история ваших посещений и записей врачей"}
                          </CardDescription>
                        </div>
                        <div className="text-sm text-[#243352]/70 bg-[#0A6EFF]/5 py-1 px-3 rounded-full">
                          Всего записей: {medicalRecords.length}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {loadingRecords ? (
                        <div className="flex justify-center py-12 text-[#0A6EFF]">
                          <div className="animate-pulse">
                            Загрузка медицинских записей...
                          </div>
                        </div>
                      ) : medicalRecords.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-[#243352]/70">
                            Медицинские записи не найдены
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {medicalRecords.map((record) => (
                            <div
                              key={record.id}
                              className="p-5 border border-[#0A6EFF]/10 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between mb-3">
                                <div className="font-medium text-[#243352]">
                                  <span className="text-[#243352]/70 mr-1">
                                    Дата:
                                  </span>
                                  {format(
                                    new Date(record.appointment.startTime),
                                    "d MMMM yyyy",
                                    { locale: ru }
                                  )}
                                </div>
                                <div className="text-sm text-[#243352]/70 bg-[#0A6EFF]/5 px-3 py-1 rounded-full">
                                  {format(
                                    new Date(record.appointment.startTime),
                                    "HH:mm"
                                  )}
                                </div>
                              </div>

                              <div className="mb-4 p-3 bg-[#0A6EFF]/5 rounded-lg">
                                <span className="text-sm font-medium text-[#243352]/70">
                                  Врач:
                                </span>
                                <span className="ml-2 text-[#0A6EFF] font-medium">
                                  Др.{" "}
                                  {record.appointment.doctor?.user?.firstName ||
                                    "Неизвестный"}{" "}
                                  {record.appointment.doctor?.user?.lastName ||
                                    "Врач"}
                                </span>
                              </div>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-[#243352]/70 mb-2">
                                  Заключение врача:
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-[#243352] p-4 bg-[#F8FAFC] rounded-md border border-[#0A6EFF]/10">
                                  {record.doctorNotes ||
                                    "Заключение отсутствует"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <Card className="bg-white border border-[#0A6EFF]/10 shadow-sm">
                  <CardHeader className="border-b border-[#0A6EFF]/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-[#243352] flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-[#0A6EFF]" />
                          {isViewingOtherPatient
                            ? "Приемы пациента"
                            : "Мои записи"}
                        </CardTitle>
                        <CardDescription className="text-[#243352]/70">
                          {isViewingOtherPatient
                            ? `Предстоящие и прошедшие записи пациента ${displayUser.firstName} ${displayUser.lastName}`
                            : "Просмотр предстоящих и прошедших записей"}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-[#243352]/70 bg-[#0A6EFF]/5 py-1 px-3 rounded-full">
                        Активных записей: {upcomingAppointments.length}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {loadingAppointments ? (
                      <div className="flex justify-center py-12 text-[#0A6EFF]">
                        <div className="animate-pulse">Загрузка записей...</div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Upcoming Appointments */}
                        <div>
                          <h3 className="font-medium mb-4 flex items-center text-[#243352] pb-2 border-b border-[#0A6EFF]/10">
                            <Calendar className="h-5 w-5 mr-2 text-[#0A6EFF]" />
                            Предстоящие записи
                          </h3>

                          {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-[#243352]/70">
                                Нет предстоящих записей
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {upcomingAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="flex justify-between p-4 border border-[#0A6EFF]/10 rounded-lg hover:shadow-md transition-shadow bg-[#0A6EFF]/5"
                                >
                                  <div>
                                    <p className="font-medium text-[#243352]">
                                      {appointment.title || "Прием"}
                                    </p>
                                    <p className="text-sm text-[#243352]/70 mt-1">
                                      {isViewingOtherPatient ||
                                      user.role !== "DOCTOR"
                                        ? appointment.doctor && (
                                            <>
                                              Др.{" "}
                                              {
                                                appointment.doctor.user
                                                  .firstName
                                              }{" "}
                                              {appointment.doctor.user.lastName}
                                            </>
                                          )
                                        : appointment.patient && (
                                            <>
                                              {
                                                appointment.patient.user
                                                  .firstName
                                              }{" "}
                                              {
                                                appointment.patient.user
                                                  .lastName
                                              }
                                            </>
                                          )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-[#0A6EFF]">
                                      {format(
                                        new Date(appointment.startTime),
                                        "d MMMM yyyy",
                                        { locale: ru }
                                      )}
                                    </p>
                                    <p className="text-sm text-[#243352]/70 mt-1 bg-white px-3 py-1 rounded-full inline-block">
                                      {format(
                                        new Date(appointment.startTime),
                                        "HH:mm"
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        new Date(appointment.endTime),
                                        "HH:mm"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Past Appointments */}
                        <div>
                          <h3 className="font-medium mb-4 flex items-center text-[#243352] pb-2 border-b border-[#0A6EFF]/10">
                            <Calendar className="h-5 w-5 mr-2 text-[#0A6EFF]" />
                            Прошедшие записи
                          </h3>

                          {pastAppointments.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-[#243352]/70">
                                Нет прошедших записей
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {pastAppointments
                                .slice(0, 5)
                                .map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className="flex justify-between p-4 border border-[#0A6EFF]/10 rounded-lg hover:shadow-md transition-shadow"
                                  >
                                    <div>
                                      <p className="font-medium text-[#243352]">
                                        {appointment.title || "Прием"}
                                      </p>
                                      <p className="text-sm text-[#243352]/70 mt-1">
                                        {isViewingOtherPatient ||
                                        user.role !== "DOCTOR"
                                          ? appointment.doctor && (
                                              <>
                                                Др.{" "}
                                                {
                                                  appointment.doctor.user
                                                    .firstName
                                                }{" "}
                                                {
                                                  appointment.doctor.user
                                                    .lastName
                                                }
                                              </>
                                            )
                                          : appointment.patient && (
                                              <>
                                                {
                                                  appointment.patient.user
                                                    .firstName
                                                }{" "}
                                                {
                                                  appointment.patient.user
                                                    .lastName
                                                }
                                              </>
                                            )}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-[#0A6EFF]">
                                        {format(
                                          new Date(appointment.startTime),
                                          "d MMMM yyyy",
                                          { locale: ru }
                                        )}
                                      </p>
                                      <p className="text-sm text-[#243352]/70 mt-1 bg-[#0A6EFF]/5 px-3 py-1 rounded-full inline-block">
                                        {format(
                                          new Date(appointment.startTime),
                                          "HH:mm"
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          new Date(appointment.endTime),
                                          "HH:mm"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                              {pastAppointments.length > 5 && (
                                <Button
                                  asChild
                                  variant="outline"
                                  className="w-full mt-4 bg-white text-[#0A6EFF] border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 h-11"
                                >
                                  <a
                                    href={`/calendar${
                                      isViewingOtherPatient
                                        ? `?patientId=${viewPatientId}`
                                        : ""
                                    }`}
                                  >
                                    Просмотреть все записи
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#243352]">
              Редактирование профиля
            </DialogTitle>
            <DialogDescription className="text-[#243352]/70">
              Обновите вашу личную информацию
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#243352] font-medium">
                Имя
              </Label>
              <Input
                id="firstName"
                value={profileFormData.firstName}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    firstName: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#243352] font-medium">
                Фамилия
              </Label>
              <Input
                id="lastName"
                value={profileFormData.lastName}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    lastName: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#243352] font-medium">
                Номер телефона
              </Label>
              <Input
                id="phone"
                value={profileFormData.phone}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    phone: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#243352] font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-[#F8FAFC] border-2 border-[#0A6EFF]/10"
              />
              <p className="text-xs text-[#243352]/70">Email нельзя изменить</p>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
              className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateUser.isLoading}
              className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white disabled:opacity-70"
            >
              {updateUser.isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white border-2 border-[#0A6EFF]/10 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#243352]">
              Изменение пароля
            </DialogTitle>
            <DialogDescription className="text-[#243352]/70">
              Обновите ваш пароль
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-[#243352] font-medium"
              >
                Текущий пароль
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordFormData.currentPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    currentPassword: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-[#243352] font-medium"
              >
                Новый пароль
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordFormData.newPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    newPassword: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#243352] font-medium"
              >
                Подтвердите новый пароль
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordFormData.confirmPassword}
                onChange={(e) =>
                  setPasswordFormData({
                    ...passwordFormData,
                    confirmPassword: e.target.value,
                  })
                }
                className="border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={updatePassword.isLoading}
              className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white disabled:opacity-70"
            >
              {updatePassword.isLoading ? "Обновление..." : "Обновить пароль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
