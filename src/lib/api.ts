// src/lib/api.ts
import { Appointment, Doctor, Patient, User, MedicalRecord } from "./types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;

  // Only access localStorage in browser environment
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // Create headers with correct Authorization format
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Log the actual response for debugging
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);

      // Try to parse as JSON if possible
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || "Something went wrong" };
      }

      // If unauthorized and in browser, consider clearing token
      if (response.status === 401 && typeof window !== "undefined") {
        console.warn("Authentication error - clearing token");
        localStorage.removeItem("token");
      }

      throw new Error(errorData.message || "Something went wrong");
    }

    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
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

// Rest of the code remains the same...
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

export const patients = {
  getAll: () => fetchWithAuth("/api/patients"),
  getById: (id: string) => fetchWithAuth(`/api/patients/${id}`),
  getMedicalRecords: (id: string) =>
    fetchWithAuth(`/api/patients/${id}/medical-records`),
};

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
