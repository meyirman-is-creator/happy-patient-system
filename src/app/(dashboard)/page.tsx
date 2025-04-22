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

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });

  // Wait for auth to be checked before redirecting
  useEffect(() => {
    if (!loading) {
      setIsLoaded(true);
    }
  }, [loading]);

  // Redirect patients to calendar page
  useEffect(() => {
    if (isLoaded && !loading && isAuthenticated && user?.role === "PATIENT") {
      redirect("/calendar");
    }
  }, [isLoaded, loading, isAuthenticated, user]);

  // Get statistics safely to avoid unnecessary API calls
  useEffect(() => {
    if (isLoaded && isAuthenticated && user && user.role !== "PATIENT") {
      // Here you would typically fetch dashboard data
      // For now, we'll just use placeholder stats
      setStats({
        upcomingAppointments: 5,
        completedAppointments: 10,
        totalDoctors: 3,
        totalPatients: 15,
      });
    }
  }, [isLoaded, isAuthenticated, user]);

  // Show nothing until we know authentication state
  if (loading || !isLoaded || !user || user.role === "PATIENT") return null;

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
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
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
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
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
            <div className="text-2xl font-bold">
              {stats.upcomingAppointments}
            </div>
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
            <div className="text-2xl font-bold">
              {stats.completedAppointments}
            </div>
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
                  {stats.upcomingAppointments} upcoming appointments. Check your
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
