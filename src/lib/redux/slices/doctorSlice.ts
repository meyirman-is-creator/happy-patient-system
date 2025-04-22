import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Doctor } from "@/lib/types";

interface DoctorState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    fetchDoctorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDoctorsSuccess: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload;
      state.loading = false;
    },
    fetchDoctorsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedDoctor: (state, action: PayloadAction<Doctor | null>) => {
      state.selectedDoctor = action.payload;
    },
    createDoctorSuccess: (state, action: PayloadAction<Doctor>) => {
      state.doctors.push(action.payload);
    },
    updateDoctorSuccess: (state, action: PayloadAction<Doctor>) => {
      const index = state.doctors.findIndex(
        (doctor) => doctor.id === action.payload.id
      );
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
      if (state.selectedDoctor?.id === action.payload.id) {
        state.selectedDoctor = action.payload;
      }
    },
    deleteDoctorSuccess: (state, action: PayloadAction<string>) => {
      state.doctors = state.doctors.filter(
        (doctor) => doctor.id !== action.payload
      );
      if (state.selectedDoctor?.id === action.payload) {
        state.selectedDoctor = null;
      }
    },
  },
});

export const {
  fetchDoctorsStart,
  fetchDoctorsSuccess,
  fetchDoctorsFailure,
  setSelectedDoctor,
  createDoctorSuccess,
  updateDoctorSuccess,
  deleteDoctorSuccess,
} = doctorSlice.actions;

export default doctorSlice.reducer;
