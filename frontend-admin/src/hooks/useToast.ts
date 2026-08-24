import { useContext } from "react";
import { ToastContext, type ToastCtx } from "@/context/ToastContext";

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
