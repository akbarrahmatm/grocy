export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_customer: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface Toast {
  id: number;
  text: string;
  variant: "success" | "error";
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  uom_id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  thumbnail: string | null;
  price: string;
  stock: number;
  is_active: boolean;
  category?: { id: number; name: string };
  uom?: { id: number; name: string; code: string };
  created_at: string | null;
  updated_at: string | null;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  qty: number;
  product?: Product;
  created_at: string | null;
  updated_at: string | null;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  receiver_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  destination_id: number | null;
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface Destination {
  id: number;
  label: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  qty: number;
  subtotal: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: "pending" | "paid" | "processing" | "completed" | "cancelled";
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_latitude: string | null;
  shipping_longitude: string | null;
  destination_id: number | null;
  courier_company: string | null;
  courier_code: string | null;
  courier_service: string | null;
  subtotal: string;
  shipping_cost: string;
  total: string;
  snap_token: string | null;
  snap_redirect_url: string | null;
  transaction_id: string | null;
  komship_order_no?: string | null;
  airway_bill?: string | null;
  paid_at: string | null;
  note: string | null;
  items?: OrderItem[];
  items_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ShippingRate {
  company: string;
  code: string;
  service: string;
  description: string;
  price: number;
  etd: string;
}

export interface RecipeHistory {
  id: number;
  user_id: number;
  dish: string;
  total_items: number;
  available_items: Array<{ id: number | null; name: string; ingredient: string; stock: number | null; product?: Product }>;
  unavailable_items: Array<{ id: number | null; name: string; ingredient: string }>;
  additional_items: Array<{ id: number | null; name: string; ingredient: string }>;
  recipe: string[];
  created_at: string;
  updated_at: string;
}