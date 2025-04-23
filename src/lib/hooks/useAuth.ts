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
import { setCookie, getCookie, deleteCookie } from "cookies-next";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = getCookie("auth_token");

        if (storedToken && !token) {
          dispatch(
            loginSuccess({
              user: null,
              token: storedToken as string,
            })
          );
        } else if (!storedToken && token) {
          setCookie("auth_token", token, {
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }

      setTokenChecked(true);
    };

    checkToken();
  }, [dispatch, token]);

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: !!token && tokenChecked,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      if (data) {
        dispatch(updateUserSuccess(data));
      }
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      dispatch(logoutAction());
      deleteCookie("auth_token");
    },
  });

  const register = useMutation({
    mutationFn: auth.register,
    onSuccess: (data) => {
      if (data.token) {
        setCookie("auth_token", data.token, {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });

        if (data.user.role === "PATIENT") {
          router.push("/calendar");
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    },
  });

  const login = useMutation({
    mutationFn: auth.login,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      if (data.token) {
        setCookie("auth_token", data.token, {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      dispatch(loginSuccess({ user: data.user, token: data.token }));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      if (data.user.role === "PATIENT") {
        router.push("/calendar");
      } else {
        router.push("/");
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      dispatch(loginFailure(error.message || "Ошибка аутентификации"));
    },
  });

  const updateUser = useMutation({
    mutationFn: auth.updateMe,
    onSuccess: (data) => {
      dispatch(updateUserSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const updatePassword = useMutation({
    mutationFn: auth.updatePassword,
  });

  const handleLogout = () => {
    deleteCookie("auth_token");
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
