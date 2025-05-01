// src/lib/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
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

// Определяем интерфейс для ошибок аутентификации
interface AuthError {
  message: string;
  code?: string;
  status?: number;
  [key: string]: unknown;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const [tokenChecked, setTokenChecked] = useState(false);

  // This effect handles token initialization from cookies
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = getCookie("auth_token");
        console.log("Token from cookies:", storedToken ? "exists" : "missing");

        if (storedToken && !token) {
          // If we have a token in cookies but not in Redux, set it in Redux
          console.log("Updating Redux with token from cookies");
          dispatch(
            loginSuccess({
              user: null, // We'll fetch the user data with the query below
              token: storedToken as string,
            })
          );
        } else if (!storedToken && token) {
          // If we have a token in Redux but not in cookies, set it in cookies
          console.log("Updating cookies with token from Redux");
          setCookie("auth_token", token, {
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setTokenChecked(true);
      }
    };

    checkToken();
  }, [dispatch, token]);

  // Explicitly fetch user data when needed - this function will be available to components
  const refreshUserData = useCallback(async () => {
    if (token) {
      try {
        console.log("Manually refreshing user data");
        const userData = await auth.getMe();
        if (userData && userData.id) {
          console.log("User data refreshed successfully:", userData.id);
          dispatch(updateUserSuccess(userData));
          return userData;
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
    return null;
  }, [token, dispatch]);

  // This query fetches the user data once the token is available
  const { isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: auth.getMe,
    enabled: !!token && tokenChecked, // Only run when token exists and token check is complete
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      if (data) {
        console.log("User data fetched successfully via query:", data.id);
        dispatch(updateUserSuccess(data));
      }
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
      // On error, we clean up the invalid token
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
    onError: (error: AuthError) => {
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

  // If we have a token but no user, try to fetch the user data
  useEffect(() => {
    if (token && !user && !userLoading && tokenChecked) {
      console.log(
        "Token available but no user data - triggering manual refresh"
      );
      refreshUserData();
    }
  }, [token, user, userLoading, tokenChecked, refreshUserData]);

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
    refreshUserData, // Expose this function for manual refresh when needed
  };
};
