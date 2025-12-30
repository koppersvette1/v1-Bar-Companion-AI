import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import type { User } from "@shared/models/auth";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

const SESSION_CHECK_KEY = "barbuddy_last_auth_check";
const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

function shouldCheckAuth(): boolean {
  if (typeof window === "undefined") return false;
  const lastCheck = localStorage.getItem(SESSION_CHECK_KEY);
  if (!lastCheck) return true;
  const elapsed = Date.now() - parseInt(lastCheck, 10);
  return elapsed > CHECK_INTERVAL;
}

function markAuthChecked(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_CHECK_KEY, Date.now().toString());
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const result = await fetchUser();
      markAuthChecked();
      setHasCheckedOnce(true);
      return result;
    },
    retry: false,
    staleTime: CHECK_INTERVAL,
    enabled: shouldCheckAuth(),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!shouldCheckAuth() && !hasCheckedOnce) {
      setHasCheckedOnce(true);
    }
  }, [hasCheckedOnce]);

  const checkAuth = useCallback(() => {
    return refetch();
  }, [refetch]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem(SESSION_CHECK_KEY);
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user: user ?? null,
    isLoading: isLoading && !hasCheckedOnce,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    checkAuth,
  };
}
