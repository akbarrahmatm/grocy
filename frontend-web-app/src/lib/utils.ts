import { API_URL } from "@/lib/config";

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}/storage/${path.replace(/^\/+/, "")}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const STATUS_TONES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  processing: "bg-sky-100 text-sky-700",
  completed: "bg-[var(--lavender)] text-[var(--moss-dark)]",
  cancelled: "bg-red-100 text-red-700",
};

export function statusClass(status: string): string {
  return `badge ${STATUS_TONES[status] ?? "bg-[var(--lavender)] text-[var(--ink-soft)]"}`;
}