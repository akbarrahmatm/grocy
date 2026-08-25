import { LayoutDashboard, Users, Package, Warehouse } from "lucide-react";
import type { NavItem, Notification } from "../types";

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    to: "/products",
    label: "Product Managements",
    icon: Package,
    exact: false,
    children: [
      { to: "/products", label: "Products" },
      { to: "/categories", label: "Categories" },
      { to: "/products/uom", label: "Unit Of Measure" },
    ],
  },
  {
    to: "/inventory",
    label: "Inventory Managements",
    icon: Warehouse,
    exact: false,
    children: [
      { to: "/inventory/stock", label: "Stock" },
      { to: "/inventory/stock-adjustment", label: "Stock Adjustment" },
      { to: "/inventory/stock-movement", label: "Stock Movement" },
    ],
  },
  {
    to: "/users",
    label: "User Management",
    icon: Users,
    exact: false,
    children: [
      { to: "/users/admin", label: "Admin" },
      { to: "/users/customer", label: "Customer" },
    ],
  },
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
