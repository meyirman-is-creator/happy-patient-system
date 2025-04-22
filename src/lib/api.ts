import { Appointment, Doctor, Patient, User, MedicalRecord } from "./types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}

// Auth API
export const auth = {
  register: (data: any) =>
    fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: any) =>
    fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => fetchWithAuth("/api/users/me"),
  updateMe: (data: any) =>
    fetchWithAuth("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updatePassword: (data: any) =>
    fetchWithAuth("/api/users/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Appointments API
export const appointments = {
  getAll: (params?: any) => {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return fetchWithAuth(`/api/appointments${queryParams}`);
  },
  getById: (id: string) => fetchWithAuth(`/api/appointments/${id}`),
  create: (data: any) =>
    fetchWithAuth("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/api/appointments/${id}`, {
      method: "DELETE",
    }),
  confirm: (id: string) =>
    fetchWithAuth(`/api/appointments/${id}/confirm`, {
      method: "PUT",
    }),
  cancel: (id: string) =>
    fetchWithAuth(`/api/appointments/${id}/cancel`, {
      method: "PUT",
    }),
  complete: (id: string, data: any) =>
    fetchWithAuth(`/api/appointments/${id}/complete`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Doctors API
export const doctors = {
  getAll: () => fetchWithAuth("/api/doctors"),
  getById: (id: string) => fetchWithAuth(`/api/doctors/${id}`),
  create: (data: any) =>
    fetchWithAuth("/api/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/api/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/api/doctors/${id}`, {
      method: "DELETE",
    }),
};

// Patients API
export const patients = {
  getAll: () => fetchWithAuth("/api/patients"),
  getById: (id: string) => fetchWithAuth(`/api/patients/${id}`),
  getMedicalRecords: (id: string) =>
    fetchWithAuth(`/api/patients/${id}/medical-records`),
};

// Medical Records API
export const medicalRecords = {
  create: (data: any) =>
    fetchWithAuth("/api/medical-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/api/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
