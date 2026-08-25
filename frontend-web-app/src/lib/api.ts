import type {
  Address,
  AuthResponse,
  AuthUser,
  CartItem,
  Order,
  Paginated,
  Product,
} from "@/types";

const API_BASE = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "grocy_token";
const USER_KEY = "grocy_user";

interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
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

function queryString(opts: { search?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (opts.search) params.set("search", opts.search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  return params.toString();
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: password,
      }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => request<AuthUser>("/auth/me"),
};

export const productApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Product>>(`/product?${queryString(opts)}`),
  show: (id: number) => request<Product>(`/product/${id}`),
};

export const cartApi = {
  list: () => request<CartItem[]>("/cart"),
  add: (product_id: number, qty = 1) =>
    request<CartItem>("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id, qty }),
    }),
  update: (id: number, qty: number) =>
    request<CartItem>(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    }),
  remove: (id: number) =>
    request<{ message: string }>(`/cart/${id}`, { method: "DELETE" }),
};

export const addressApi = {
  list: () => request<Address[]>("/address"),
};

export const orderApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Order>>(`/order?${queryString(opts)}`),
  create: (payload: {
    address_id: number;
    note?: string;
    items: { product_id: number; qty: number }[];
  }) =>
    request<Order>("/order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export { getSessionUser, saveSession, clearSession };

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
