export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact: boolean;
}

export interface Notification {
  title: string;
  time: string;
}

export interface Toast {
  id: number;
  text: string;
}
