export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  notes: string; // Combined field for complaints/analysis/conclusion
  visitDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistory {
  patientId: string;
  records: MedicalRecord[];
}
