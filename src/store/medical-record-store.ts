import { create } from "zustand";
import { MedicalRecord, PatientMedicalHistory } from "@/types/medical-record";

interface MedicalRecordState {
  patientRecords: Record<string, MedicalRecord[]>; // Key is patientId
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPatientRecords: (patientId: string) => Promise<MedicalRecord[]>;
  addMedicalRecord: (
    record: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">
  ) => Promise<MedicalRecord>;
  clearError: () => void;
}

export const useMedicalRecordStore = create<MedicalRecordState>((set, get) => ({
  patientRecords: {},
  isLoading: false,
  error: null,

  fetchPatientRecords: async (patientId) => {
    set({ isLoading: true, error: null });
    try {
      // Check if we already have records for this patient
      const existingRecords = get().patientRecords[patientId];

      if (existingRecords) {
        set({ isLoading: false });
        return existingRecords;
      }

      // In a real app, this would be an API call
      // For now we'll mock it
      const mockRecords: MedicalRecord[] = [
        {
          id: "1",
          patientId,
          doctorId: "1",
          appointmentId: "appointment1",
          notes:
            "Patient complained of headaches. Blood pressure slightly elevated. Recommended rest and hydration.",
          visitDate: "2023-10-15T10:00:00Z",
          createdAt: "2023-10-15T10:30:00Z",
          updatedAt: "2023-10-15T10:30:00Z",
        },
        {
          id: "2",
          patientId,
          doctorId: "2",
          appointmentId: "appointment2",
          notes: "Follow-up visit. Headaches resolved. Blood pressure normal.",
          visitDate: "2023-10-29T14:00:00Z",
          createdAt: "2023-10-29T14:30:00Z",
          updatedAt: "2023-10-29T14:30:00Z",
        },
      ];

      set((state) => ({
        patientRecords: {
          ...state.patientRecords,
          [patientId]: mockRecords,
        },
        isLoading: false,
      }));

      return mockRecords;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  addMedicalRecord: async (recordData) => {
    set({ isLoading: true, error: null });
    try {
      const newRecord: MedicalRecord = {
        ...recordData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => {
        const patientRecords = { ...state.patientRecords };
        const patientId = newRecord.patientId;

        if (!patientRecords[patientId]) {
          patientRecords[patientId] = [];
        }

        patientRecords[patientId] = [...patientRecords[patientId], newRecord];

        return { patientRecords, isLoading: false };
      });

      return newRecord;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
