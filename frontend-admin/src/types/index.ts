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

export interface Toast {
  id: number;
  text: string;
  variant: "success" | "error";
}
