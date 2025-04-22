"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  User,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatients } from "@/lib/hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment, Patient } from "@/lib/types";
import { AppointmentStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PatientAppointmentItemProps {
  patient: Patient;
  appointment?: Appointment;
  onMarkAttended?: (appointmentId: string) => void;
  onMarkMissed?: (appointmentId: string) => void;
  onAddNotes?: (appointmentId: string, patientId: string) => void;
}

function PatientAppointmentItem({
  patient,
  appointment,
  onMarkAttended,
  onMarkMissed,
  onAddNotes,
}: PatientAppointmentItemProps) {
  const initials =
    `${patient.user.firstName[0]}${patient.user.lastName[0]}`.toUpperCase();
  const isPast = appointment
    ? new Date(appointment.endTime) < new Date()
    : false;

  return (
    <Card className="mb-4 bg-white border border-[#0A6EFF]/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 border-b border-[#0A6EFF]/10 bg-gradient-to-r from-[#0A6EFF]/5 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-[#0A6EFF]/10 ring-2 ring-[#0A6EFF]/20">
              <AvatarFallback className="text-[#0A6EFF] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-[#243352]">
                {patient.user.firstName} {patient.user.lastName}
              </CardTitle>
              <p className="text-sm text-[#243352]/70">{patient.user.email}</p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
          >
            <Link href={`/calendar?patientId=${patient.id}`}>
              <Calendar className="h-4 w-4 mr-2 text-[#0A6EFF]" />
              История
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {appointment ? (
          <div>
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 mr-2 text-[#0A6EFF]" />
              <span className="text-sm text-[#243352]">
                {format(new Date(appointment.startTime), "d MMM yyyy • HH:mm", {
                  locale: ru,
                })}{" "}
                -{format(new Date(appointment.endTime), " HH:mm")}
              </span>
              {appointment.status === AppointmentStatus.OCCUPIED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Завершен
                </span>
              )}
              {isPast && appointment.status === AppointmentStatus.BOOKED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Пропущен
                </span>
              )}
            </div>

            {appointment.title && (
              <p className="text-sm font-medium mb-2 text-[#0A6EFF]">
                {appointment.title}
              </p>
            )}

            {appointment.symptoms && (
              <div className="mb-3 p-3 bg-[#0A6EFF]/5 rounded-lg">
                <p className="text-xs font-medium text-[#243352]/70 mb-1">
                  Симптомы:
                </p>
                <p className="text-sm text-[#243352]">{appointment.symptoms}</p>
              </div>
            )}

            {appointment.status === AppointmentStatus.BOOKED && !isPast && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onMarkAttended?.(appointment.id)}
                  className="bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
                >
                  Отметить посещение
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkMissed?.(appointment.id)}
                  className="border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
                >
                  Не явился
                </Button>
              </div>
            )}

            {appointment.status === AppointmentStatus.OCCUPIED && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant={appointment.medicalRecord ? "outline" : "default"}
                  onClick={() => onAddNotes?.(appointment.id, patient.id)}
                  className={
                    appointment.medicalRecord
                      ? "border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
                      : "bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {appointment.medicalRecord
                    ? "Редактировать медкарту"
                    : "Добавить запись в медкарту"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#243352]/70 text-center py-4">
            Нет запланированных приемов
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface PatientListProps {
  appointments?: Appointment[];
  isLoading?: boolean;
  onMarkAttended?: (appointmentId: string) => void;
  onMarkMissed?: (appointmentId: string) => void;
  onAddNotes?: (appointmentId: string, patientId: string) => void;
}

export function PatientList({
  appointments = [],
  isLoading,
  onMarkAttended,
  onMarkMissed,
  onAddNotes,
}: PatientListProps) {
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter patients by search query
  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
    const email = patient.user.email.toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query);
  });

  if (isLoading || patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#0A6EFF]">
        <div className="animate-pulse">Загрузка данных пациентов...</div>
      </div>
    );
  }

  const upcomingAppointments = appointments
    .filter(
      (app) =>
        app.status === AppointmentStatus.BOOKED &&
        new Date(app.startTime) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const pastAppointments = appointments
    .filter(
      (app) =>
        app.status === AppointmentStatus.OCCUPIED ||
        (app.status === AppointmentStatus.BOOKED &&
          new Date(app.endTime) < new Date())
    )
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#243352] flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#0A6EFF]" />
          Список пациентов
          <span className="ml-2 text-sm font-normal text-[#243352]/70 bg-[#0A6EFF]/5 px-2 py-1 rounded-full">
            Всего: {patients.length}
          </span>
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#0A6EFF]" />
          <Input
            type="search"
            placeholder="Поиск пациента..."
            className="pl-10 h-10 border-2 border-[#0A6EFF]/10 focus:border-[#0A6EFF] focus:ring-1 focus:ring-[#0A6EFF]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6 bg-[#0A6EFF]/5 p-1 rounded-lg w-full">
          <TabsTrigger
            value="upcoming"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#0A6EFF] data-[state=active]:shadow-sm rounded-md py-2"
          >
            Предстоящие ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#0A6EFF] data-[state=active]:shadow-sm rounded-md py-2"
          >
            Прошедшие ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#0A6EFF] data-[state=active]:shadow-sm rounded-md py-2"
          >
            Все пациенты ({filteredPatients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#0A6EFF]/10">
              <p className="text-[#243352]/70">Нет предстоящих приемов</p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => {
              const patient = patients.find(
                (p) => p.id === appointment.patientId
              );
              if (!patient) return null;

              return (
                <PatientAppointmentItem
                  key={appointment.id}
                  patient={patient}
                  appointment={appointment}
                  onMarkAttended={onMarkAttended}
                  onMarkMissed={onMarkMissed}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#0A6EFF]/10">
              <p className="text-[#243352]/70">Нет прошедших приемов</p>
            </div>
          ) : (
            pastAppointments.map((appointment) => {
              const patient = patients.find(
                (p) => p.id === appointment.patientId
              );
              if (!patient) return null;

              return (
                <PatientAppointmentItem
                  key={appointment.id}
                  patient={patient}
                  appointment={appointment}
                  onAddNotes={onAddNotes}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="all">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#0A6EFF]/10">
              <p className="text-[#243352]/70">Пациенты не найдены</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="bg-white border border-[#0A6EFF]/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2 border-b border-[#0A6EFF]/10 bg-gradient-to-r from-[#0A6EFF]/5 to-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-[#0A6EFF]/10 ring-2 ring-[#0A6EFF]/20">
                        <AvatarFallback className="text-[#0A6EFF] font-medium">
                          {`${patient.user.firstName[0]}${patient.user.lastName[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-[#243352]">
                          {patient.user.firstName} {patient.user.lastName}
                        </CardTitle>
                        <p className="text-sm text-[#243352]/70">
                          {patient.gender || "Не указан"} •{" "}
                          {patient.dateOfBirth
                            ? format(
                                new Date(patient.dateOfBirth),
                                "d MMMM yyyy",
                                { locale: ru }
                              )
                            : "Дата рождения не указана"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[#0A6EFF]" />
                        <span className="text-[#243352]">
                          {patient.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[#0A6EFF]" />
                        <span className="text-[#243352]">
                          {patient.user.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#0A6EFF]" />
                        <span className="text-[#243352]">
                          Регистрация:{" "}
                          {format(
                            new Date(patient.user.createdAt),
                            "d MMMM yyyy",
                            { locale: ru }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 border-2 border-[#0A6EFF]/10 hover:bg-[#0A6EFF]/5 text-[#243352]"
                      >
                        <Link href={`/calendar?patientId=${patient.id}`}>
                          <Calendar className="h-4 w-4 mr-2 text-[#0A6EFF]" />
                          История
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 bg-[#0A6EFF] hover:bg-[#0A6EFF]/90 text-white"
                      >
                        <Link href={`/calendar?patientId=${patient.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Медкарта
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
