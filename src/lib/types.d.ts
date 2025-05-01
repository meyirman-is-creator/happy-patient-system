import { Role, AppointmentStatus } from "@prisma/client";
// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AppointmentFormData {
  doctorId: string;
  patientId?: string;
  startTime: Date | string;
  duration: number;
  title?: string;
  symptoms?: string;
}

export interface MedicalRecordFormData {
  appointmentId: string;
  doctorNotes: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface DoctorFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization?: string;
  education?: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Event types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  resourceId?: string;
}

// Query parameters
export interface AppointmentQueryParams {
  doctorId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
}

// Component prop types
export interface SelectOption {
  value: string;
  label: string;
}

// Toast action types
export type ToastActionType =
  | "ADD_TOAST"
  | "UPDATE_TOAST"
  | "DISMISS_TOAST"
  | "REMOVE_TOAST";
