import { CheckCircle2, CircleAlert } from "lucide-react";
import { createContext, useState, type ReactNode } from "react";
import type { Toast } from "@/types";

export interface ToastCtx {
  push: (text: string, variant?: "success" | "error") => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(text: string, variant: "success" | "error" = "success") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <ToastList toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastList({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg animate-[fade-in_.2s_ease] flex items-center gap-2"
          style={{
            background: t.variant === "error" ? "var(--coral)" : "var(--moss)",
            color: "#fff",
          }}
        >
          {t.variant === "error" ? (
            <CircleAlert size={16} className="shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="shrink-0" />
          )}
          {t.text}
        </div>
      ))}
    </div>
  );
}