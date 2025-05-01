import { Role, AppointmentStatus } from "@prisma/client";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  createdAt: Date; // Use Date instead of string, it's safer
  updatedAt: Date; // Use Date instead of string, it's safer
};

export type Doctor = {
  id: string;
  userId: string;
  specialization?: string | null;
  education?: string | null;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Patient = {
  id: string;
  userId: string;
  dateOfBirth?: Date | null; // Changed to Date | null for consistency
  gender?: string | null;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  doctorId: string;
  patientId?: string | null;
  startTime: Date; // Using Date for better handling
  endTime: Date; // Using Date for better handling
  title?: string | null;
  symptoms?: string | null;
  status: AppointmentStatus;
  doctor: Doctor;
  patient?: Patient | null;
  medicalRecord?: MedicalRecord | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MedicalRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorNotes?: string | null;
  appointment: Appointment;
  createdAt: Date;
  updatedAt: Date;
};

export type TimeSlot = {
  startTime: Date; // Using Date for better handling
  endTime: Date; // Using Date for better handling
  status: AppointmentStatus;
  appointmentId?: string;
};

export type CalendarDay = {
  date: Date; // Using Date for better handling
  slots: TimeSlot[];
};

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type AppointmentFormData = {
  doctorId: string;
  patientId?: string;
  startTime: Date; // Using Date for better handling
  duration: number;
  title?: string;
  symptoms?: string;
};

export type MedicalRecordFormData = {
  appointmentId: string;
  doctorNotes: string;
};
