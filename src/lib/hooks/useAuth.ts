// src/lib/hooks/useAuth.ts (update exports)
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

  // Get current user
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: !!token,
    retry: false,
    onSuccess: (data) => {
      if (data) {
        dispatch(updateUserSuccess(data));
      }
    },
    onError: () => {
      dispatch(logoutAction());
      router.push("/login");
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
      dispatch(loginFailure(error.message));
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
