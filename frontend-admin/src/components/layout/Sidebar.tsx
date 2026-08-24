import { useState } from "react";
import { ChevronDown, ShoppingCart, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";
import { getSessionUser } from "@/lib/api";
import type { NavItem } from "@/types";
import Avatar from "@/components/ui/Avatar";

const GROUP_KEY = "grocy_sidebar_groups";

function loadGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GROUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(item.to + "/");
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const user = getSessionUser();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(loadGroups);

  function toggleGroup(to: string) {
    setOpenGroups((s) => {
      const next = { ...s, [to]: !s[to] };
      localStorage.setItem(GROUP_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`ad-sidebar fixed md:sticky top-0 left-0 h-screen w-60 flex flex-col z-40 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: "var(--ad-border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "#3B82F6" }}
            >
              <ShoppingCart size={18} className="text-white" />
            </div>
            <span
              className="font-bold text-[15px]"
              style={{ color: "var(--ad-fg)" }}
            >
              Grocy
            </span>
          </div>
          <button className="md:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const groupOpen = openGroups[item.to] ?? true;
              return (
                <div key={item.to}>
                  <button
                    onClick={() => toggleGroup(item.to)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{ color: "var(--ad-fg)" }}
                  >
                    <Icon size={17} />
                    {item.label}
                    <ChevronDown
                      size={15}
                      className="ml-auto transition-transform"
                      style={{
                        color: "var(--ad-muted)",
                        transform: groupOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      }}
                    />
                  </button>

                  {groupOpen && (
                    <div
                      className="ml-5 pl-3 border-l space-y-0.5"
                      style={{ borderColor: "var(--ad-border)" }}
                    >
                      {item.children.map((child) => {
                        const active =
                          pathname === child.to ||
                          pathname.startsWith(child.to + "/");
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className="block px-3 py-1.5 rounded-md text-sm font-medium relative transition-colors"
                            style={{
                              color: active
                                ? "var(--ad-fg)"
                                : "var(--ad-muted)",
                              background: active
                                ? "var(--ad-active-bg)"
                                : "transparent",
                            }}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item, pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium relative transition-colors"
                style={{
                  color: active ? "var(--ad-fg)" : "var(--ad-muted)",
                  background: active ? "var(--ad-active-bg)" : "transparent",
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                    style={{ background: "#3B82F6" }}
                  />
                )}
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className="m-3 p-3 rounded-lg flex items-center gap-3"
          style={{ background: "var(--ad-active-bg)" }}
        >
          <Avatar name={user?.name ?? "User"} size={36} />
          <div className="min-w-0">
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "var(--ad-fg)" }}
            >
              {user?.name ?? "User"}
            </div>
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold mt-0.5"
              style={{ color: "#3B82F6", background: "rgba(59,130,246,0.15)" }}
            >
              {user && user.is_customer ? "CUSTOMER" : "ADMIN"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}