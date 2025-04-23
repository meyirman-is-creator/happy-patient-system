// src/lib/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";
import { getCookie } from "cookies-next";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initialize state with cookies if in browser environment
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Try to get token from cookies if in browser environment
if (typeof window !== "undefined") {
  try {
    const token = getCookie("auth_token");
    if (token) {
      initialState.token = token as string;
      initialState.isAuthenticated = true;
      console.log("Auth slice initialized with token from cookies");
    }
  } catch (error) {
    console.error("Error accessing cookies:", error);
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
      action: PayloadAction<{ user: User | null; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      console.log(
        "Login success - user:",
        action.payload.user?.id || "null",
        "token:",
        action.payload.token.substring(0, 10) + "..."
      );
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      console.log("Login failure:", action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      console.log("User logged out");
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      console.log("User updated in redux store:", action.payload.id);
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
