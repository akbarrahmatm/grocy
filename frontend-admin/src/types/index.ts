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
  is_active: boolean;
  category?: { id: number; name: string };
  uom?: { id: number; name: string; code: string };
  created_at: string | null;
  updated_at: string | null;
}

export interface Toast {
  id: number;
  text: string;
  variant: "success" | "error";
}
