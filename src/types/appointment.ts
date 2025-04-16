export enum SlotStatus {
  FREE = "free",
  BOOKED = "booked",
  OCCUPIED = "occupied",
}

export interface Slot {
  id: string;
  doctorId: string;
  patientId?: string;
  date: string; // ISO date string
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSchedule {
  doctorId: string;
  slots: Slot[];
}

export interface AppointmentDetails {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
}
