import type {
  Address,
  AuthResponse,
  AuthUser,
  Category,
  Integration,
  Order,
  Paginated,
  Product,
  StockAdjustment,
  StockMovement,
  Uom,
} from "@/types";

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

function queryString(opts: { search?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (opts.search) params.set("search", opts.search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  return params.toString();
}

export const userApi = {
  list: (
    opts: { role?: "admin" | "customer"; search?: string; page?: number } = {}
  ) => {
    const params = new URLSearchParams();
    if (opts.role) params.set("role", opts.role);
    if (opts.search) params.set("search", opts.search);
    if (opts.page && opts.page > 1) params.set("page", String(opts.page));
    return request<Paginated<AuthUser>>(`/user?${params.toString()}`);
  },
  create: (payload: {
    name: string;
    email: string;
    password: string;
    is_customer: boolean;
  }) =>
    request<AuthUser>("/user", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        is_customer: payload.is_customer ? 1 : 0,
      }),
    }),
};

export const categoryApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Category>>(`/category?${queryString(opts)}`),
  create: (payload: Record<string, unknown>) =>
    request<Category>("/category", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Record<string, unknown>) =>
    request<Category>(`/category/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) => request<{ message: string }>(`/category/${id}`, { method: "DELETE" }),
};

export const uomApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Uom>>(`/uom?${queryString(opts)}`),
  create: (payload: Record<string, unknown>) =>
    request<Uom>("/uom", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Record<string, unknown>) =>
    request<Uom>(`/uom/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) => request<{ message: string }>(`/uom/${id}`, { method: "DELETE" }),
};

export const productApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Product>>(`/product?${queryString(opts)}`),
  create: (payload: Record<string, unknown>) =>
    request<Product>("/product", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Record<string, unknown>) =>
    request<Product>(`/product/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<{ message: string }>(`/product/${id}`, { method: "DELETE" }),
};

export const stockAdjustmentApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<StockAdjustment>>(
      `/inventory/stock-adjustment?${queryString(opts)}`
    ),
  create: (payload: Record<string, unknown>) =>
    request<StockAdjustment>("/inventory/stock-adjustment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const stockMovementApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<StockMovement>>(
      `/inventory/stock-movement?${queryString(opts)}`
    ),
};

export interface GatewayPayload {
  environment?: string;
  is_active?: boolean;
  config: Record<string, string>;
}

export const settingsApi = {
  gateways: () => request<Integration[]>("/settings/gateways"),
  update: (provider: string, payload: GatewayPayload) =>
    request<Integration>(`/settings/gateways/${provider}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  test: (provider: string, payload: GatewayPayload) =>
    request<{ ok: boolean; message: string }>(
      `/settings/gateways/${provider}/test`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
};

export const addressApi = {
  list: () => request<Address[]>("/address"),
  create: (payload: Record<string, unknown>) =>
    request<Address>("/address", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Record<string, unknown>) =>
    request<Address>(`/address/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<{ message: string }>(`/address/${id}`, { method: "DELETE" }),
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