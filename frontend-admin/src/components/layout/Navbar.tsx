import { useState } from "react";
import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NOTIFICATIONS } from "@/lib/constants";
import { authApi, clearSession } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

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
  const [confirmLogout, setConfirmLogout] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore server errors; session is cleared client-side
    }
    clearSession();
    push("Logged out");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header
      className="sticky top-0 z-20 px-4 md:px-6 h-16 flex items-center gap-3 border-b backdrop-blur"
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

        {/* Logout */}
        <button
          onClick={() => setConfirmLogout(true)}
          title="Log out"
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>

    {confirmLogout && (
      <div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
        onClick={() => setConfirmLogout(false)}
      >
        <div
          className="ad-card w-full max-w-sm p-6 ad-fade"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <LogOut size={18} style={{ color: "#EF4444" }} />
            </span>
            <div>
              <h3 className="font-bold" style={{ color: "var(--ad-fg)" }}>
                Log out?
              </h3>
              <p className="text-xs" style={{ color: "var(--ad-muted)" }}>
                Your session will be ended.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmLogout(false)}
              className="ad-btn ad-btn-ghost flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="ad-btn ad-btn-danger flex-1 justify-center"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
