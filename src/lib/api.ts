import { getCookie } from "cookies-next";

// Определение интерфейсов для всех типов данных
type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
};

interface LoginData {
  email: string;
  password: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface AppointmentQueryParams {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
  [key: string]: string | undefined; // Добавляем сигнатуру индекса
}

interface AppointmentData {
  doctorId: string;
  patientId?: string;
  date: string;
  time: string;
  duration: number;
  reason: string;
  status?: string;
  title: string | null | undefined;
}

interface AppointmentCompletionData {
  notes: string;
  diagnosis?: string;
  treatment?: string;
  followUpRecommendations?: string;
}

export interface CreateDoctorData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  education: string;
}

// New interface for doctor updates to match component expectations
export interface UpdateDoctorData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  education?: string;
}

interface MedicalRecordData {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  date?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;

  // Get token from cookies
  token = getCookie("auth_token");

  // Create headers with correct Authorization format
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    console.log(`API Request: ${options.method || "GET"} ${url}`);

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
      } catch {
        errorData = { message: errorText || "Something went wrong" };
      }

      throw new Error(errorData.message || "Something went wrong");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// Auth API
export const auth = {
  register: (data: FormData) =>
    fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: LoginData) =>
    fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: async () => {
    try {
      console.log("Calling /api/users/me to fetch user data");
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${getCookie("auth_token")}`,
        },
      });

      if (!response.ok) {
        console.error(`Error fetching user: HTTP ${response.status}`);
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch user data");
      }

      const userData = await response.json();
      console.log("User data fetched successfully:", userData);

      if (!userData || !userData.id) {
        console.error("Invalid user data received:", userData);
        throw new Error("Invalid user data received");
      }

      return userData;
    } catch (error) {
      console.error("getMe error:", error);
      throw error;
    }
  },

  updateMe: (data: UpdateUserData) =>
    fetchWithAuth("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updatePassword: (data: UpdatePasswordData) =>
    fetchWithAuth("/api/users/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const appointments = {
  getAll: (params?: AppointmentQueryParams) => {
    // Преобразуем params в Record<string, string>, исключая undefined значения
    const queryParams = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .reduce(
              (acc, [key, value]) => ({ ...acc, [key]: value as string }),
              {}
            )
        ).toString()}`
      : "";
    return fetchWithAuth(`/api/appointments${queryParams}`);
  },
  getById: (id: string) => fetchWithAuth(`/api/appointments/${id}`),
  create: (data: AppointmentData) => {
    // Get the timezone offset in hours and minutes
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * -1; // Negate to get the correct sign
    const tzHours = Math.floor(tzOffset / 60);
    const tzMinutes = tzOffset % 60;
    const tzSign = tzHours >= 0 ? "+" : "-";
    const tzFormatted = `${tzSign}${Math.abs(tzHours).toString().padStart(2, "0")}:${Math.abs(tzMinutes).toString().padStart(2, "0")}`;

    // Format startTime with timezone info
    const dateTimeWithTz = `${data.date}T${data.time}:00${tzFormatted}`;

    // Transform the data to match what the API expects
    const transformedData = {
      doctorId: data.doctorId,
      patientId: data.patientId,
      startTime: dateTimeWithTz, // Include timezone information
      symptoms: data.reason, // Map reason to symptoms
      duration: data.duration,
      title: data.title,
      status: data.status,
    };

    return fetchWithAuth("/api/appointments", {
      method: "POST",
      body: JSON.stringify(transformedData),
    });
  },
  update: (id: string, data: Partial<AppointmentData>) =>
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
  complete: (id: string, data: AppointmentCompletionData) =>
    fetchWithAuth(`/api/appointments/${id}/complete`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
export const doctors = {
  getAll: () => fetchWithAuth("/api/doctors"),
  getById: (id: string) => fetchWithAuth(`/api/doctors/${id}`),
  create: (data: CreateDoctorData) =>
    fetchWithAuth("/api/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateDoctorData) =>
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
  create: (data: MedicalRecordData) =>
    fetchWithAuth("/api/medical-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<MedicalRecordData>) =>
    fetchWithAuth(`/api/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
