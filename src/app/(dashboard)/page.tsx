"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import {
  Calendar,
  Users,
  UserCheck,
  Activity,
  ListChecks,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppointments } from "@/lib/hooks/useQueries";
import { useDoctors } from "@/lib/hooks/useQueries";
import { usePatients } from "@/lib/hooks/useQueries";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: appointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();

  // Redirect patients to calendar page
  useEffect(() => {
    if (user?.role === "PATIENT") {
      redirect("/calendar");
    }
  }, [user]);

  if (!user || user.role === "PATIENT") return null;

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    (app) => app.status === "BOOKED"
  ).length;

  const completedAppointments = appointments.filter(
    (app) => app.status === "OCCUPIED"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {user.role === "ADMIN" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Doctors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Appointments
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              {user.role === "DOCTOR" ? (
                <p>
                  Welcome, Dr. {user.firstName} {user.lastName}. You have{" "}
                  {upcomingAppointments} upcoming appointments. Check your
                  schedule in the calendar or manage your patients from the
                  menu.
                </p>
              ) : (
                <p>
                  Welcome, {user.firstName} {user.lastName}. You can manage
                  doctors, patients and appointments from the dashboard. Use the
                  menu to navigate to different sections.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="justify-start" asChild>
                <a href="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </a>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <a href="/listing">
                  <Users className="mr-2 h-4 w-4" />
                  {user.role === "DOCTOR" ? "View Patients" : "Manage Users"}
                </a>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <a href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
