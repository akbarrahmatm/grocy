import { API_URL } from "./config";
import { Colors } from "@/constants/theme";

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}/storage/${path.replace(/^\/+/, "")}`;
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Rp 0";
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  return `Rp ${num.toLocaleString("id-ID")}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return String(value);
  }
}

export function getStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return { bg: Colors.amberLight, text: Colors.amber };
    case "paid":
      return { bg: Colors.emeraldLight, text: Colors.emerald };
    case "processing":
      return { bg: Colors.skyLight, text: Colors.skyText };
    case "completed":
      return { bg: Colors.lavender, text: Colors.mossDark };
    case "cancelled":
      return { bg: Colors.redLight, text: Colors.red };
    default:
      return { bg: Colors.lavender, text: Colors.inkSoft };
  }
}
