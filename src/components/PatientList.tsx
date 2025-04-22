"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatients } from "@/lib/hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment, Patient } from "@/lib/types";
import { AppointmentStatus } from "@prisma/client";

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
    <Card className="mb-4 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/30 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 border-b border-blue-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500/20 dark:ring-blue-400/20">
              <AvatarFallback className="text-blue-700 dark:text-blue-300 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-300">
                {patient.user.firstName} {patient.user.lastName}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {patient.user.email}
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300 transition-colors"
          >
            <Link href={`/calendar?patientId=${patient.id}`}>
              <Calendar className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              History
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {appointment ? (
          <div>
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {format(
                  new Date(appointment.startTime),
                  "MMM d, yyyy • h:mm a"
                )}{" "}
                -{format(new Date(appointment.endTime), " h:mm a")}
              </span>
              {appointment.status === AppointmentStatus.OCCUPIED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </span>
              )}
              {isPast && appointment.status === AppointmentStatus.BOOKED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Missed
                </span>
              )}
            </div>

            {appointment.title && (
              <p className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">
                {appointment.title}
              </p>
            )}

            {appointment.symptoms && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Symptoms:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {appointment.symptoms}
                </p>
              </div>
            )}

            {appointment.status === AppointmentStatus.BOOKED && !isPast && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onMarkAttended?.(appointment.id)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  Mark as Attended
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkMissed?.(appointment.id)}
                  className="border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300 transition-colors"
                >
                  No-show
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
                      ? "border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-700 dark:text-blue-300 transition-colors"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  }
                >
                  {appointment.medicalRecord
                    ? "Edit Medical Record"
                    : "Add Medical Record"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No appointments scheduled
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

  if (isLoading || patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-700 dark:text-blue-300">
        <div className="animate-pulse">Loading patients...</div>
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
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6 bg-blue-100 dark:bg-gray-800 p-1 rounded-lg w-full">
          <TabsTrigger
            value="upcoming"
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md py-2 transition-all"
          >
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md py-2 transition-all"
          >
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-blue-100 dark:border-blue-900/30">
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming appointments
              </p>
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
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-blue-100 dark:border-blue-900/30">
              <p className="text-gray-500 dark:text-gray-400">
                No past appointments
              </p>
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
      </Tabs>
    </div>
  );
}
