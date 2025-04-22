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
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {patient.user.firstName} {patient.user.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {patient.user.email}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/calendar?patientId=${patient.id}`}>
              <Calendar className="h-4 w-4 mr-2" />
              History
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointment ? (
          <div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                {format(
                  new Date(appointment.startTime),
                  "MMM d, yyyy • h:mm a"
                )}{" "}
                -{format(new Date(appointment.endTime), " h:mm a")}
              </span>
              {appointment.status === AppointmentStatus.OCCUPIED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </span>
              )}
              {isPast && appointment.status === AppointmentStatus.BOOKED && (
                <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Missed
                </span>
              )}
            </div>

            {appointment.title && (
              <p className="text-sm font-medium mb-1">{appointment.title}</p>
            )}

            {appointment.symptoms && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Symptoms:
                </p>
                <p className="text-sm">{appointment.symptoms}</p>
              </div>
            )}

            {appointment.status === AppointmentStatus.BOOKED && !isPast && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => onMarkAttended?.(appointment.id)}
                >
                  Mark as Attended
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkMissed?.(appointment.id)}
                >
                  No-show
                </Button>
              </div>
            )}

            {appointment.status === AppointmentStatus.OCCUPIED && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant={appointment.medicalRecord ? "outline" : "default"}
                  onClick={() => onAddNotes?.(appointment.id, patient.id)}
                >
                  {appointment.medicalRecord
                    ? "Edit Medical Record"
                    : "Add Medical Record"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
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
    return <div>Loading patients...</div>;
  }

  // Filter appointments by status
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
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming appointments
            </p>
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
            <p className="text-muted-foreground text-center py-8">
              No past appointments
            </p>
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
