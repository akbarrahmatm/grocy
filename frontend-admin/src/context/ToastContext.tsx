import { CheckCircle2 } from "lucide-react";
import { createContext, useState, type ReactNode } from "react";
import type { Toast } from "@/types";

export interface ToastCtx {
  push: (text: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(text: string) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
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
          className="ad-card px-4 py-2.5 text-sm font-medium shadow-lg ad-fade flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-green-500" />
          {t.text}
        </div>
      ))}
    </div>
  );
}
