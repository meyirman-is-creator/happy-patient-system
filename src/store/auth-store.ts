import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UserRole,
} from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now we'll mock it
          const mockUsers = {
            patient1: {
              id: "1",
              firstName: "John",
              lastName: "Doe",
              username: "patient1",
              phoneNumber: "+12345678901",
              role: UserRole.PATIENT,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            doctor1: {
              id: "2",
              firstName: "Jane",
              lastName: "Smith",
              username: "doctor1",
              phoneNumber: "+12345678902",
              role: UserRole.DOCTOR,
              specialization: "Cardiologist",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            admin1: {
              id: "3",
              firstName: "Admin",
              lastName: "User",
              username: "admin1",
              phoneNumber: "+12345678903",
              role: UserRole.ADMIN,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };

          if (credentials.username in mockUsers) {
            const user =
              mockUsers[credentials.username as keyof typeof mockUsers];
            const mockToken = "mock-jwt-token";

            set({
              user,
              token: mockToken,
              isLoading: false,
            });
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now we'll mock it
          const newUser: User = {
            id: Math.random().toString(36).substring(2, 9),
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            phoneNumber: userData.phoneNumber,
            role: UserRole.PATIENT, // Default role for new registrations
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken = "mock-jwt-token";

          set({
            user: newUser,
            token: mockToken,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
