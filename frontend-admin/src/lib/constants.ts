import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  ScrollText,
  FileBarChart,
  LifeBuoy,
  FolderKanban,
} from "lucide-react";
import type { NavItem, Notification } from "../types";

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/projects", label: "Projects", icon: FolderKanban, exact: false },
  { to: "/users", label: "Users", icon: Users, exact: false },
  { to: "/roles", label: "Roles & Permissions", icon: Shield, exact: false },
  { to: "/settings", label: "System Settings", icon: Settings, exact: false },
  { to: "/logs", label: "Activity Logs", icon: ScrollText, exact: false },
  { to: "/reports", label: "Reports", icon: FileBarChart, exact: false },
  { to: "/tickets", label: "Support Tickets", icon: LifeBuoy, exact: false },
];

export const NOTIFICATIONS: Notification[] = [
  { title: "New signup: priya@acme.com", time: "2 min ago" },
  { title: "Backup completed successfully", time: "2 hr ago" },
  { title: "3 failed login attempts detected", time: "3 hr ago" },
];

export const CURRENT_USER = {
  name: "Alex Morgan",
  role: "SUPER ADMIN",
} as const;
