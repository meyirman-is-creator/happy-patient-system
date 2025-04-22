import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Appointment, CalendarDay } from "@/lib/types";

interface AppointmentState {
  appointments: Appointment[];
  calendar: CalendarDay[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  calendar: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
      state.loading = false;
    },
    fetchCalendarSuccess: (state, action: PayloadAction<CalendarDay[]>) => {
      state.calendar = action.payload;
      state.loading = false;
    },
    fetchAppointmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedAppointment: (
      state,
      action: PayloadAction<Appointment | null>
    ) => {
      state.selectedAppointment = action.payload;
    },
    createAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointmentSuccess: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(
        (appointment) => appointment.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      if (state.selectedAppointment?.id === action.payload.id) {
        state.selectedAppointment = action.payload;
      }
    },
    deleteAppointmentSuccess: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(
        (appointment) => appointment.id !== action.payload
      );
      if (state.selectedAppointment?.id === action.payload) {
        state.selectedAppointment = null;
      }
    },
  },
});

export const {
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchCalendarSuccess,
  fetchAppointmentsFailure,
  setSelectedAppointment,
  createAppointmentSuccess,
  updateAppointmentSuccess,
  deleteAppointmentSuccess,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
