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
import { useToast } from "@/components/ui/toast";
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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-xl">
                  {user.role === "DOCTOR" ? "Dr. " : ""}
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span>
                  Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                setProfileFormData({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone,
                });
                setShowProfileDialog(true);
              }}
              className="w-full"
              variant="outline"
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full"
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
          >
            <TabsList className="mb-4">
              {user.role === "PATIENT" && (
                <TabsTrigger value="medical-records">
                  Medical Records
                </TabsTrigger>
              )}
              <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            </TabsList>

            {/* Medical Records Tab - Only for Patients */}
            {user.role === "PATIENT" && (
              <TabsContent value="medical-records">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>
                      Your complete medical history and records from visits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingRecords ? (
                      <p>Loading medical records...</p>
                    ) : medicalRecords.length === 0 ? (
                      <p className="text-muted-foreground">
                        No medical records found
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {medicalRecords.map((record) => (
                          <div
                            key={record.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">
                                <span className="text-muted-foreground">
                                  Date:{" "}
                                </span>
                                {format(
                                  new Date(record.appointment.startTime),
                                  "MMMM d, yyyy"
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(
                                  new Date(record.appointment.startTime),
                                  "h:mm a"
                                )}
                              </div>
                            </div>

                            <div className="mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Doctor:{" "}
                              </span>
                              <span>
                                Dr. {record.appointment.doctor.user.firstName}{" "}
                                {record.appointment.doctor.user.lastName}
                              </span>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Doctor's Notes:
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm">
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
              <Card>
                <CardHeader>
                  <CardTitle>My Appointments</CardTitle>
                  <CardDescription>
                    View your upcoming and past appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAppointments ? (
                    <p>Loading appointments...</p>
                  ) : (
                    <div className="space-y-6">
                      {/* Upcoming Appointments */}
                      <div>
                        <h3 className="font-medium mb-4 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Upcoming Appointments
                        </h3>

                        {upcomingAppointments.length === 0 ? (
                          <p className="text-muted-foreground">
                            No upcoming appointments
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex justify-between p-3 border rounded-md"
                              >
                                <div>
                                  <p className="font-medium">
                                    {appointment.title || "Appointment"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
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
                                  <p className="text-sm">
                                    {format(
                                      new Date(appointment.startTime),
                                      "MMMM d, yyyy"
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
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
                        <h3 className="font-medium mb-4 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Past Appointments
                        </h3>

                        {pastAppointments.length === 0 ? (
                          <p className="text-muted-foreground">
                            No past appointments
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {pastAppointments.slice(0, 5).map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex justify-between p-3 border rounded-md"
                              >
                                <div>
                                  <p className="font-medium">
                                    {appointment.title || "Appointment"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
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
                                  <p className="text-sm">
                                    {format(
                                      new Date(appointment.startTime),
                                      "MMMM d, yyyy"
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
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
                                className="w-full"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileFormData.firstName}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    firstName: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileFormData.lastName}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    lastName: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileFormData.phone}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateUser.isLoading}
            >
              {updateUser.isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your password</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={updatePassword.isLoading}
            >
              {updatePassword.isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
