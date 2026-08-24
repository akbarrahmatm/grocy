import { useState } from "react";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/constants";

interface NavbarProps {
  title: string;
  dark: boolean;
  onToggleDark: () => void;
  onOpenSidebar: () => void;
}

export default function Navbar({
  title,
  dark,
  onToggleDark,
  onOpenSidebar,
}: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center gap-3 border-b backdrop-blur"
      style={{
        borderColor: "var(--ad-border)",
        background: "var(--ad-header-bg)",
      }}
    >
      <button className="md:hidden" onClick={onOpenSidebar}>
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold mr-2" style={{ color: "var(--ad-fg)" }}>
        {title}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--ad-muted)" }}
        />
        <input
          placeholder="Search projects, users, invoices…"
          className="w-full pl-9 pr-3 py-2 rounded-md text-sm border outline-none focus:border-blue-500"
          style={{
            background: "var(--ad-card)",
            borderColor: "var(--ad-border)",
            color: "var(--ad-fg)",
          }}
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2 relative">
        {/* Notifications */}
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Bell size={18} />
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ background: "#EF4444" }}
          >
            {NOTIFICATIONS.length}
          </span>
        </button>

        {notifOpen && (
          <div
            className="absolute right-10 top-12 w-72 rounded-lg border shadow-lg overflow-hidden ad-fade"
            style={{
              background: "var(--ad-card)",
              borderColor: "var(--ad-border)",
            }}
          >
            <div
              className="px-3 py-2 border-b text-sm font-semibold"
              style={{ borderColor: "var(--ad-border)" }}
            >
              Notifications
            </div>
            {NOTIFICATIONS.map((n, i) => (
              <div
                key={i}
                className="px-3 py-2.5 text-sm border-b last:border-b-0"
                style={{ borderColor: "var(--ad-border)" }}
              >
                <div style={{ color: "var(--ad-fg)" }}>{n.title}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--ad-muted)" }}
                >
                  {n.time}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
