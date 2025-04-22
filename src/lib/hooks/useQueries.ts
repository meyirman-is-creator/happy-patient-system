import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "../redux/hooks";
import { appointments, doctors, patients, medicalRecords } from "../api";
import {
  fetchAppointmentsSuccess,
  createAppointmentSuccess,
  updateAppointmentSuccess,
  deleteAppointmentSuccess,
} from "../redux/slices/appointmentSlice";
import {
  fetchDoctorsSuccess,
  createDoctorSuccess,
  updateDoctorSuccess,
  deleteDoctorSuccess,
} from "../redux/slices/doctorSlice";
import {
  fetchPatientsSuccess,
  fetchMedicalRecordsSuccess,
  createMedicalRecordSuccess,
  updateMedicalRecordSuccess,
} from "../redux/slices/patientSlice";

// Appointment Hooks
export const useAppointments = (params?: any) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointments.getAll(params),
    onSuccess: (data) => {
      dispatch(fetchAppointmentsSuccess(data));
    },
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointments.getById(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: any) => appointments.create(data),
    onSuccess: (data) => {
      dispatch(createAppointmentSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointments.update(id, data),
    onSuccess: (data) => {
      dispatch(updateAppointmentSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", data.id] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => appointments.delete(id),
    onSuccess: (_, id) => {
      dispatch(deleteAppointmentSuccess(id));
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointments.confirm(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", data.id] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointments.cancel(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", data.id] });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointments.complete(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["medical-records", data.patientId],
      });
    },
  });
};

// Doctor Hooks
export const useDoctors = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctors.getAll(),
    onSuccess: (data) => {
      dispatch(fetchDoctorsSuccess(data));
    },
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctors.getById(id),
    enabled: !!id,
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: any) => doctors.create(data),
    onSuccess: (data) => {
      dispatch(createDoctorSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      doctors.update(id, data),
    onSuccess: (data) => {
      dispatch(updateDoctorSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => doctors.delete(id),
    onSuccess: (_, id) => {
      dispatch(deleteDoctorSuccess(id));
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

// Patient Hooks
export const usePatients = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ["patients"],
    queryFn: () => patients.getAll(),
    onSuccess: (data) => {
      dispatch(fetchPatientsSuccess(data));
    },
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => patients.getById(id),
    enabled: !!id,
  });
};

export const usePatientMedicalRecords = (id: string) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ["medical-records", id],
    queryFn: () => patients.getMedicalRecords(id),
    enabled: !!id,
    onSuccess: (data) => {
      dispatch(fetchMedicalRecordsSuccess(data));
    },
  });
};

// Medical Record Hooks
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: any) => medicalRecords.create(data),
    onSuccess: (data) => {
      dispatch(createMedicalRecordSuccess(data));
      queryClient.invalidateQueries({
        queryKey: ["medical-records", data.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["appointment", data.appointmentId],
      });
    },
  });
};

export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicalRecords.update(id, data),
    onSuccess: (data) => {
      dispatch(updateMedicalRecordSuccess(data));
      queryClient.invalidateQueries({
        queryKey: ["medical-records", data.patientId],
      });
    },
  });
};
