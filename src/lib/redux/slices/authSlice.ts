import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initialize with null, then check localStorage in a safer way
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Try to get token from localStorage if in browser environment
if (typeof window !== "undefined") {
  try {
    initialState.token = localStorage.getItem("token");
    initialState.isAuthenticated = !!initialState.token;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("token", action.payload.token);
        } catch (error) {
          console.error("Error saving token to localStorage:", error);
        }
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("token");
        } catch (error) {
          console.error("Error removing token from localStorage:", error);
        }
      }
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserSuccess,
} = authSlice.actions;

export default authSlice.reducer;
