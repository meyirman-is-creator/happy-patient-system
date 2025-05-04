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
import {
  Doctor,
  Appointment,
  Patient,
  MedicalRecord,
  AppointmentData
} from "@/lib/types";

interface AppointmentParams {
  doctorId?: string;
  patientId?: string;
  date?: string;
  status?: string;
  [key: string]: string | undefined;
}
export type MedicalRecordData = {
  patientId: string;
  appointmentId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  doctorNotes?: string | null;
};
interface AppointmentCompletionData {
  notes: string;
  diagnosis?: string;
  prescription?: string;
  [key: string]: unknown;
}

interface CreateDoctorData {
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: "DOCTOR";
  };
  specialization: string;
  education: string;
}

interface UpdateDoctorData {
  id: string;
  data: {
    specialization?: string;
    education?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  };
}

export const useAppointments = (params?: AppointmentParams) => {
  const dispatch = useAppDispatch();
  const query = useQuery<Appointment[]>({
    queryKey: ["appointments", params],
    queryFn: () => appointments.getAll(params),
  });

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
    mutationFn: (data: AppointmentData) => {
      const formattedData = {
        ...data,
        patientId: data.patientId ?? undefined,
        duration: data.duration ?? 30  
      };
      return appointments.create(formattedData);
    },
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const formattedData = {
        ...data,
        patientId: data.patientId ?? undefined
      };
      return appointments.update(id, formattedData);
    },
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

export const useDoctors = () => {
  const dispatch = useAppDispatch();
  const query = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: () => doctors.getAll(),
  });

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
    mutationFn: (data: CreateDoctorData) => {
      const doctorData = {
        ...data,
        name: `${data.user.firstName} ${data.user.lastName}`
      };
      return doctors.create(doctorData);
    },
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
    mutationFn: ({ id, data }: UpdateDoctorData) => doctors.update(id, data),
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

export const usePatients = () => {
  const dispatch = useAppDispatch();
  const query = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: () => patients.getAll(),
  });

  useEffect(() => {
    if (query.data) {
      const formattedData = query.data.map(patient => ({
        ...patient,
        name: `${patient.user.firstName} ${patient.user.lastName}`,
        createdAt: patient.createdAt instanceof Date 
          ? patient.createdAt.toISOString() 
          : patient.createdAt,
        updatedAt: patient.updatedAt instanceof Date 
          ? patient.updatedAt.toISOString() 
          : patient.updatedAt
      }));
      dispatch(fetchPatientsSuccess(formattedData));
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

  useEffect(() => {
    if (query.data) {
      const formattedData = query.data.map(record => ({
        id: record.id,
        appointmentId: record.appointmentId,
        patientId: record.patientId,
        doctorNotes: record.doctorNotes,
        diagnosis: record.doctorNotes || '',
        treatment: record.doctorNotes || '',
        date: record.createdAt instanceof Date 
          ? record.createdAt.toISOString() 
          : record.createdAt,
        createdAt: record.createdAt instanceof Date 
          ? record.createdAt.toISOString() 
          : record.createdAt,
        updatedAt: record.updatedAt instanceof Date 
          ? record.updatedAt.toISOString() 
          : record.updatedAt
      }));
      dispatch(fetchMedicalRecordsSuccess(formattedData));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: MedicalRecordData) => medicalRecords.create(data),
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
