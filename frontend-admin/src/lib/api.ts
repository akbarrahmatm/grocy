import type { AuthResponse, AuthUser } from "@/types";

const API_BASE = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "grocy_token";
const USER_KEY = "grocy_user";

interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Request failed (${res.status})`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    if (
      body &&
      typeof body === "object" &&
      "errors" in body &&
      typeof (body as { errors: unknown }).errors === "object"
    ) {
      err.errors = (body as { errors: Record<string, string[]> }).errors;
    }
    throw err;
  }

  return body as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => request<AuthUser>("/auth/me"),
};