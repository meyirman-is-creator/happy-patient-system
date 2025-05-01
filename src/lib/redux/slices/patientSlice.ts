import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Определяем базовую модель с полями аудита
interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Определение пользователя (User)
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  [key: string]: unknown;
}

// Обновленный интерфейс Patient
interface Patient extends BaseModel {
  name: string;
  userId: string;
  user?: User;
  [key: string]: unknown;
}

// Определяем Appointment (так как есть ссылка из MedicalRecord)
interface Appointment extends BaseModel {
  
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

// Обновленный интерфейс MedicalRecord
interface MedicalRecord extends BaseModel {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  treatment: string;
  date: string;
  appointment?: Appointment;
  [key: string]: unknown;
}

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  medicalRecords: MedicalRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: [],
  selectedPatient: null,
  medicalRecords: [],
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    fetchPatientsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action: PayloadAction<Patient[]>) => {
      state.patients = action.payload;
      state.loading = false;
    },
    fetchPatientsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
    },
    fetchMedicalRecordsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMedicalRecordsSuccess: (
      state,
      action: PayloadAction<MedicalRecord[]>
    ) => {
      state.medicalRecords = action.payload;
      state.loading = false;
    },
    fetchMedicalRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createMedicalRecordSuccess: (
      state,
      action: PayloadAction<MedicalRecord>
    ) => {
      state.medicalRecords.push(action.payload);
    },
    updateMedicalRecordSuccess: (
      state,
      action: PayloadAction<MedicalRecord>
    ) => {
      const index = state.medicalRecords.findIndex(
        (record) => record.id === action.payload.id
      );
      if (index !== -1) {
        state.medicalRecords[index] = action.payload;
      }
    },
  },
});

export const {
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  setSelectedPatient,
  fetchMedicalRecordsStart,
  fetchMedicalRecordsSuccess,
  fetchMedicalRecordsFailure,
  createMedicalRecordSuccess,
  updateMedicalRecordSuccess,
} = patientSlice.actions;

export default patientSlice.reducer;