// src/lib/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { auth } from "../api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateUserSuccess,
} from "../redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const [tokenChecked, setTokenChecked] = useState(false);

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const checkToken = async () => {
      const storedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // If we have a token in localStorage but not in Redux, update Redux
      if (storedToken && !token) {
        dispatch(
          loginSuccess({
            user: null, // We'll get the user info from the API
            token: storedToken,
          })
        );
      } else if (!storedToken && token) {
        // We have a token in Redux but not in localStorage, update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
      }

      setTokenChecked(true);
    };

    checkToken();
  }, [dispatch, token]);

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: !!token && tokenChecked, // Only run if token exists and initial token check is done
    retry: 1, // Try once more if it fails
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      if (data) {
        // Set user data in Redux if we get it
        dispatch(updateUserSuccess(data));
      }
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      // Clear token and state on auth error
      dispatch(logoutAction());
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: auth.register,
    onSuccess: () => {
      router.push("/login");
    },
  });

  // Login mutation
  const login = useMutation({
    mutationFn: auth.login,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      // Ensure token is stored in localStorage
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token stored in localStorage:", data.token);
      }

      dispatch(loginSuccess({ user: data.user, token: data.token }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Redirect based on user role
      if (data.user.role === "PATIENT") {
        router.push("/calendar");
      } else {
        router.push("/");
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      dispatch(loginFailure(error.message || "Authentication failed"));
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: auth.updateMe,
    onSuccess: (data) => {
      dispatch(updateUserSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: auth.updatePassword,
  });

  // Logout function
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    dispatch(logoutAction());
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: loading || userLoading,
    error,
    register,
    login,
    logout: handleLogout,
    updateUser,
    updatePassword,
  };
};
