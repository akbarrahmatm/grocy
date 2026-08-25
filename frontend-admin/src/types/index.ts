export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact: boolean;
  children?: { to: string; label: string }[];
}

export interface Notification {
  title: string;
  time: string;
}

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

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Uom {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  products_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Product {
  id: number;
  category_id: number;
  uom_id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  stock: number;
  is_active: boolean;
  category?: { id: number; name: string };
  uom?: { id: number; name: string; code: string };
  created_at: string | null;
  updated_at: string | null;
}

export interface StockAdjustment {
  id: number;
  product_id: number;
  type: "in" | "out";
  qty: number;
  note: string | null;
  product?: { id: number; name: string; sku: string };
  created_at: string | null;
  updated_at: string | null;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: "in" | "out";
  qty: number;
  ref_type: string | null;
  ref_id: number | null;
  note: string | null;
  product?: { id: number; name: string; sku: string };
  created_at: string | null;
  updated_at: string | null;
}

export interface Integration {
  provider: string;
  is_active: boolean;
  environment: "sandbox" | "production";
  config: Record<string, string>;
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
  latitude: string | null;
  longitude: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
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
  subtotal: string;
  shipping_cost: string;
  total: string;
  snap_token: string | null;
  snap_redirect_url: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  note: string | null;
  user?: { id: number; name: string; email: string };
  items?: OrderItem[];
  items_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Toast {
  id: number;
  text: string;
  variant: "success" | "error";
}
