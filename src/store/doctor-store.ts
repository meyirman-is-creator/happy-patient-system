import { create } from "zustand";
import { Doctor, UserRole } from "@/types/user";

interface DoctorState {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDoctors: () => Promise<void>;
  addDoctor: (
    doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">
  ) => Promise<Doctor>;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Promise<Doctor>;
  deleteDoctor: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  doctors: [],
  isLoading: false,
  error: null,

  fetchDoctors: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll mock it
      const mockDoctors: Doctor[] = [
        {
          id: "1",
          firstName: "Jane",
          lastName: "Smith",
          username: "doctor1",
          phoneNumber: "+12345678901",
          role: UserRole.DOCTOR,
          specialization: "Cardiologist",
          description: "Experienced cardiologist with 10+ years of practice",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          firstName: "Michael",
          lastName: "Johnson",
          username: "doctor2",
          phoneNumber: "+12345678902",
          role: UserRole.DOCTOR,
          specialization: "Neurologist",
          description: "Specializing in neurological disorders",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          firstName: "Sarah",
          lastName: "Williams",
          username: "doctor3",
          phoneNumber: "+12345678903",
          role: UserRole.DOCTOR,
          specialization: "Dermatologist",
          description: "Skin care specialist",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      set({ doctors: mockDoctors, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addDoctor: async (doctorData) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll mock it
      const newDoctor: Doctor = {
        ...doctorData,
        id: Math.random().toString(36).substring(2, 9),
        role: UserRole.DOCTOR,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        doctors: [...state.doctors, newDoctor],
        isLoading: false,
      }));

      return newDoctor;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateDoctor: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll mock it
      const doctors = get().doctors;
      const doctorIndex = doctors.findIndex((d) => d.id === id);

      if (doctorIndex === -1) {
        throw new Error("Doctor not found");
      }

      const updatedDoctor: Doctor = {
        ...doctors[doctorIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const updatedDoctors = [...doctors];
      updatedDoctors[doctorIndex] = updatedDoctor;

      set({ doctors: updatedDoctors, isLoading: false });

      return updatedDoctor;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteDoctor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For now we'll mock it
      const doctors = get().doctors;
      const filteredDoctors = doctors.filter((d) => d.id !== id);

      if (filteredDoctors.length === doctors.length) {
        throw new Error("Doctor not found");
      }

      set({ doctors: filteredDoctors, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
