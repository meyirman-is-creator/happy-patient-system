"use client";

import { useState } from "react";
import { format } from "date-fns";
import { UserCircle, Mail, Phone, Lock, Calendar } from "lucide-react";

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
} from "@/lib/hooks/useQueries";
import { AppointmentStatus } from "@prisma/client";

export default function ProfilePage() {
  const { user, updateUser, updatePassword } = useAuth();
  const { toast } = useToast();

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

  // Fetch medical records for patients
  const { data: medicalRecords = [], isLoading: loadingRecords } =
    usePatientMedicalRecords(user?.patientProfile?.id || "");

  // Fetch appointments for the current user
  const { data: appointments = [], isLoading: loadingAppointments } =
    useAppointments();

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

  const handleUpdateProfile = async () => {
    try {
      await updateUser.mutateAsync(profileFormData);

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      setShowProfileDialog(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile information.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Your new password and confirmation do not match.",
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
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordDialog(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="p-6 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-sm space-y-8">
      <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-300 border-b border-blue-100 dark:border-gray-700 pb-4">
        My Profile
      </h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/30 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-28 w-28 bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-500/20 dark:ring-blue-400/20">
                <AvatarFallback className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-2xl text-blue-800 dark:text-blue-300">
                  {user.role === "DOCTOR" ? "Dr. " : ""}
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70 font-medium">
                  {user.role === "DOCTOR"
                    ? "Doctor"
                    : user.role === "ADMIN"
                    ? "Administrator"
                    : "Patient"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 mt-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user.phone}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
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
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 h-11 transition-colors"
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-700 h-11 transition-colors"
              variant="outline"
            >
              Change Password
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs
            defaultValue={
              user.role === "PATIENT" ? "medical-records" : "appointments"
            }
            className="w-full"
          >
            <TabsList className="mb-6 bg-blue-100 dark:bg-gray-800 p-1 rounded-lg w-full">
              {user.role === "PATIENT" && (
                <TabsTrigger
                  value="medical-records"
                  className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md py-2 transition-all"
                >
                  Medical Records
                </TabsTrigger>
              )}
              <TabsTrigger
                value="appointments"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md py-2 transition-all"
              >
                My Appointments
              </TabsTrigger>
            </TabsList>

            {/* Medical Records Tab - Only for Patients */}
            {user.role === "PATIENT" && (
              <TabsContent value="medical-records">
                <Card className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/30 shadow-md">
                  <CardHeader className="border-b border-blue-100 dark:border-gray-700">
                    <CardTitle className="text-xl text-blue-800 dark:text-blue-300">
                      Medical History
                    </CardTitle>
                    <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                      Your complete medical history and records from visits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {loadingRecords ? (
                      <div className="flex justify-center py-12 text-blue-700 dark:text-blue-300">
                        <div className="animate-pulse">
                          Loading medical records...
                        </div>
                      </div>
                    ) : medicalRecords.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                          No medical records found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {medicalRecords.map((record) => (
                          <div
                            key={record.id}
                            className="p-5 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between mb-3">
                              <div className="font-medium text-blue-800 dark:text-blue-300">
                                <span className="text-gray-600 dark:text-gray-400 mr-1">
                                  Date:
                                </span>
                                {format(
                                  new Date(record.appointment.startTime),
                                  "MMMM d, yyyy"
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                {format(
                                  new Date(record.appointment.startTime),
                                  "h:mm a"
                                )}
                              </div>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Doctor:
                              </span>
                              <span className="ml-2 text-blue-700 dark:text-blue-300 font-medium">
                                Dr. {record.appointment.doctor.user.firstName}{" "}
                                {record.appointment.doctor.user.lastName}
                              </span>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Doctor's Notes:
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                {record.doctorNotes}
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
              <Card className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900/30 shadow-md">
                <CardHeader className="border-b border-blue-100 dark:border-gray-700">
                  <CardTitle className="text-xl text-blue-800 dark:text-blue-300">
                    My Appointments
                  </CardTitle>
                  <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                    View your upcoming and past appointments
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingAppointments ? (
                    <div className="flex justify-center py-12 text-blue-700 dark:text-blue-300">
                      <div className="animate-pulse">
                        Loading appointments...
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Upcoming Appointments */}
                      <div>
                        <h3 className="font-medium mb-4 flex items-center text-blue-800 dark:text-blue-300 pb-2 border-b border-blue-100 dark:border-gray-700">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Upcoming Appointments
                        </h3>

                        {upcomingAppointments.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                              No upcoming appointments
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex justify-between p-4 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg hover:shadow-md transition-shadow"
                              >
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">
                                    {appointment.title || "Appointment"}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {user.role !== "DOCTOR" &&
                                      appointment.doctor && (
                                        <>
                                          Dr.{" "}
                                          {appointment.doctor.user.firstName}{" "}
                                          {appointment.doctor.user.lastName}
                                        </>
                                      )}
                                    {user.role === "DOCTOR" &&
                                      appointment.patient && (
                                        <>
                                          {appointment.patient.user.firstName}{" "}
                                          {appointment.patient.user.lastName}
                                        </>
                                      )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {format(
                                      new Date(appointment.startTime),
                                      "MMMM d, yyyy"
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                                    {format(
                                      new Date(appointment.startTime),
                                      "h:mm a"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(appointment.endTime),
                                      "h:mm a"
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
                        <h3 className="font-medium mb-4 flex items-center text-blue-800 dark:text-blue-300 pb-2 border-b border-blue-100 dark:border-gray-700">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Past Appointments
                        </h3>

                        {pastAppointments.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                              No past appointments
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {pastAppointments.slice(0, 5).map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex justify-between p-4 border-2 border-blue-100 dark:border-blue-900/30 rounded-lg hover:shadow-md transition-shadow"
                              >
                                <div>
                                  <p className="font-medium text-blue-800 dark:text-blue-300">
                                    {appointment.title || "Appointment"}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {user.role !== "DOCTOR" &&
                                      appointment.doctor && (
                                        <>
                                          Dr.{" "}
                                          {appointment.doctor.user.firstName}{" "}
                                          {appointment.doctor.user.lastName}
                                        </>
                                      )}
                                    {user.role === "DOCTOR" &&
                                      appointment.patient && (
                                        <>
                                          {appointment.patient.user.firstName}{" "}
                                          {appointment.patient.user.lastName}
                                        </>
                                      )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {format(
                                      new Date(appointment.startTime),
                                      "MMMM d, yyyy"
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">
                                    {format(
                                      new Date(appointment.startTime),
                                      "h:mm a"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(appointment.endTime),
                                      "h:mm a"
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {pastAppointments.length > 5 && (
                              <Button
                                asChild
                                variant="outline"
                                className="w-full mt-4 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-gray-700 h-11 transition-colors"
                              >
                                <a href="/calendar">View All Appointments</a>
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

      {/* Edit Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name
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
                value={profileFormData.lastName}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    lastName: e.target.value,
                  })
                }
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
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
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
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
                value={user.email}
                disabled
                className="bg-gray-100 dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
              className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateUser.isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {updateUser.isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-700 rounded-xl shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your password
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Current Password
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
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New Password
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
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
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
                className="border-2 border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="border-2 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={updatePassword.isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {updatePassword.isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
