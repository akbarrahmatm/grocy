import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Address,
  AuthResponse,
  AuthUser,
  CartItem,
  Category,
  Destination,
  Order,
  Paginated,
  Product,
  RecipeHistory,
  ShippingRate,
} from "@/types";
import { API_URL } from "./config";

const API_BASE = `${API_URL}/api`;
const TOKEN_KEY = "grocy_token";
const USER_KEY = "grocy_user";

// In-memory cache for fast synchronous access
let cachedToken: string | null = null;
let cachedUser: AuthUser | null = null;
let isInitialized = false;

export interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

export async function initSession(): Promise<{ token: string | null; user: AuthUser | null }> {
  try {
    const [token, rawUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    cachedToken = token;
    if (rawUser) {
      try {
        cachedUser = JSON.parse(rawUser) as AuthUser;
      } catch {
        cachedUser = null;
      }
    }
  } catch {
    cachedToken = null;
    cachedUser = null;
  }
  isInitialized = true;
  return { token: cachedToken, user: cachedUser };
}

export function getToken(): string | null {
  return cachedToken;
}

export function getSessionUser(): AuthUser | null {
  return cachedUser;
}

export async function saveSession(auth: AuthResponse): Promise<void> {
  cachedToken = auth.token;
  cachedUser = auth.user;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, auth.token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(auth.user)),
  ]);
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  cachedUser = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export function isAuthenticated(): boolean {
  return Boolean(cachedToken);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isInitialized && cachedToken === null) {
    await initSession();
  }
  const token = cachedToken;

  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = new Error(`Network error: ${msg}. Check if backend server is running at ${API_URL}`) as ApiError;
    err.status = 0;
    throw err;
  }

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

function queryString(opts: { search?: string; page?: number; category_id?: number } = {}): string {
  const params = new URLSearchParams();
  if (opts.search) params.set("search", opts.search);
  if (opts.category_id) params.set("category_id", String(opts.category_id));
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
  list: (opts: { search?: string; page?: number; category_id?: number } = {}) =>
    request<Paginated<Product>>(`/product?${queryString(opts)}`),
  show: (id: number) => request<Product>(`/product/${id}`),
};

export const categoryApi = {
  list: (opts: { search?: string; page?: number } = {}) =>
    request<Paginated<Category>>(`/category?${queryString(opts)}`),
};

export type RecipeSuggestResponse = {
  dish: string;
  products: Product[];
  available_items: Array<{
    id: number | null;
    name: string;
    stock: number | null;
    ingredient: string;
    product?: Product;
  }>;
  unavailable_items: Array<{ id: number | null; name: string; ingredient: string }>;
  additional_items: Array<{ id: number | null; name: string; ingredient: string }>;
  recipe: string[];
  total_items: number;
};

export const recipeApi = {
  suggest: (
    dish: string,
    opts?: { signal?: AbortSignal }
  ): Promise<RecipeSuggestResponse & { history_id?: number }> =>
    request<RecipeSuggestResponse & { history_id?: number }>("/recipe/suggest", {
      method: "POST",
      body: JSON.stringify({ dish }),
      signal: opts?.signal,
    }),
  history: (page = 1) =>
    request<Paginated<RecipeHistory>>(`/recipe/history?page=${page}`),
  historyShow: (id: number): Promise<RecipeSuggestResponse & { id: number; created_at: string }> =>
    request<RecipeSuggestResponse & { id: number; created_at: string }>(
      `/recipe/history/${id}`
    ),
  historyDelete: (id: number) =>
    request<{ message: string }>(`/recipe/history/${id}`, { method: "DELETE" }),
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
  show: (id: number) => request<Order>(`/order/${id}`),
  create: (payload: {
    address_id: number;
    note?: string;
    items: { product_id: number; qty: number }[];
    courier?: { code: string; service: string };
  }) =>
    request<Order>("/order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const shippingApi = {
  destinations: (q: string) =>
    request<{ data: Destination[] }>(
      `/shipping/destinations?q=${encodeURIComponent(q)}`
    ),
  rates: (address_id: number, items: { product_id: number; qty: number }[]) =>
    request<{ data: ShippingRate[] }>("/shipping/rates", {
      method: "POST",
      body: JSON.stringify({ address_id, items }),
    }),
};
