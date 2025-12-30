import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";

interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

async function fetchSession(): Promise<SessionResponse> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return { authenticated: false, user: null };
    }

    return response.json();
  } catch {
    return { authenticated: false, user: null };
  }
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
  
  const { data: session, isLoading, refetch } = useQuery<SessionResponse>({
    queryKey: ["/api/auth/session"],
    queryFn: async () => {
      const result = await fetchSession();
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
      queryClient.setQueryData(["/api/auth/session"], { authenticated: false, user: null });
    },
  });

  return {
    user: session?.user ?? null,
    isLoading: isLoading && !hasCheckedOnce,
    isAuthenticated: session?.authenticated ?? false,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    checkAuth,
  };
}
