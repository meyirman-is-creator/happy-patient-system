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
import { useEffect } from "react";
import { Doctor,Appointment } from "@/lib/types";
// Базовый интерфейс для моделей с общими полями аудита
interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Определяем типы данных
interface AppointmentParams {
  doctorId?: string;
  patientId?: string;
  date?: string;
  status?: string;
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

interface AppointmentCompletionData {
  notes: string;
  diagnosis?: string;
  prescription?: string;
  [key: string]: unknown;
}

// Appointment Hooks
export const useAppointments = (params?: AppointmentParams) => {
  const dispatch = useAppDispatch();
  const query = useQuery<Appointment[]>({
    queryKey: ["appointments", params],
    queryFn: () => appointments.getAll(params),
  });

  // Обрабатываем успешное получение данных
  useEffect(() => {
    if (query.data) {
      dispatch(fetchAppointmentsSuccess(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useAppointment = (id: string) => {
  return useQuery<Appointment>({
    queryKey: ["appointment", id],
    queryFn: () => appointments.getById(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: Appointment) => appointments.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AppointmentCompletionData;
    }) => appointments.complete(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", data.id] });
      if (data.patientId) {
        queryClient.invalidateQueries({
          queryKey: ["medical-records", data.patientId],
        });
      }
    },
  });
};

// Doctor Hooks
export const useDoctors = () => {
  const dispatch = useAppDispatch();
  const query = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: () => doctors.getAll(),
  });

  // Обрабатываем успешное получение данных
  useEffect(() => {
    if (query.data) {
      dispatch(fetchDoctorsSuccess(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useDoctor = (id: string) => {
  return useQuery<Doctor>({
    queryKey: ["doctor", id],
    queryFn: () => doctors.getById(id),
    enabled: !!id,
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: Doctor) => doctors.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) =>
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
  const query = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: () => patients.getAll(),
  });

  // Обрабатываем успешное получение данных
  useEffect(() => {
    if (query.data) {
      dispatch(fetchPatientsSuccess(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};

export const usePatient = (id: string) => {
  return useQuery<Patient>({
    queryKey: ["patient", id],
    queryFn: () => patients.getById(id),
    enabled: !!id,
  });
};

export const usePatientMedicalRecords = (id: string) => {
  const dispatch = useAppDispatch();
  const query = useQuery<MedicalRecord[]>({
    queryKey: ["medical-records", id],
    queryFn: () => patients.getMedicalRecords(id),
    enabled: !!id,
  });

  // Обрабатываем успешное получение данных
  useEffect(() => {
    if (query.data) {
      dispatch(fetchMedicalRecordsSuccess(query.data));
    }
  }, [query.data, dispatch]);

  return query;
};

// Medical Record Hooks
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: MedicalRecord) => medicalRecords.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalRecord> }) =>
      medicalRecords.update(id, data),
    onSuccess: (data) => {
      dispatch(updateMedicalRecordSuccess(data));
      queryClient.invalidateQueries({
        queryKey: ["medical-records", data.patientId],
      });
    },
  });
};