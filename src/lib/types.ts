import { Role, AppointmentStatus } from "@prisma/client";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
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
  dateOfBirth?: Date | null;
  gender?: string | null;
  user: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  doctorId: string;
  patientId?: string | null;
  startTime: Date;
  endTime: Date;
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
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  appointmentId?: string;
};

export type CalendarDay = {
  date: Date;
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
  startTime: Date;
  duration: number;
  title?: string;
  symptoms?: string;
};

export type MedicalRecordFormData = {
  appointmentId: string;
  doctorNotes: string;
};

export type CreateAppointmentRequest = {
  doctorId: string;
  patientId?: string | null;
  date: string;
  time: string;
  reason: string;
  duration?: number;
  title?: string | null;
  status?: AppointmentStatus;
};

export type AppointmentData = {
  doctorId: string;
  patientId?: string | undefined;
  date: string;
  time: string;
  reason: string;
  duration?: number;  // Сделать duration опциональным
  title?: string | null;
  status?: AppointmentStatus;
};