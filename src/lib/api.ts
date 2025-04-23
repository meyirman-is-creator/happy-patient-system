import { getCookie } from "cookies-next";

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
      } catch (e) {
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
