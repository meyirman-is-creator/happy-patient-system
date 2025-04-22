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

  // Проверяем, существует ли token в localStorage при монтировании
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        // Если токен есть в localStorage, но не в Redux
        if (storedToken && !token) {
          dispatch(
            loginSuccess({
              user: null, // Получим информацию о пользователе из API
              token: storedToken,
            })
          );
        } else if (!storedToken && token) {
          // Токен есть в Redux, но не в localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
          }
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }

      setTokenChecked(true);
    };

    checkToken();
  }, [dispatch, token]);

  // Получаем текущего пользователя
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: !!token && tokenChecked && typeof window !== "undefined", // Запускаем только при наличии токена
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 минут
    onSuccess: (data) => {
      if (data) {
        dispatch(updateUserSuccess(data));
      }
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      dispatch(logoutAction());
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  });

  // Регистрация
  const register = useMutation({
    mutationFn: auth.register,
    onSuccess: () => {
      router.push("/login");
    },
  });

  // Вход
  const login = useMutation({
    mutationFn: auth.login,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
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

  // Обновление профиля
  const updateUser = useMutation({
    mutationFn: auth.updateMe,
    onSuccess: (data) => {
      dispatch(updateUserSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // Обновление пароля
  const updatePassword = useMutation({
    mutationFn: auth.updatePassword,
  });

  // Выход
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
