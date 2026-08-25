import { useState } from "react";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";
import { getSessionUser } from "@/lib/api";
import type { NavItem } from "@/types";
import Avatar from "@/components/ui/Avatar";

const GROUP_KEY = "grocy_sidebar_groups";
const COLLAPSE_KEY = "grocy_sidebar_collapsed";

function loadGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GROUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function loadCollapsed(): boolean {
  return localStorage.getItem(COLLAPSE_KEY) === "1";
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
  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(loadGroups);
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  function toggleGroup(to: string) {
    setOpenGroups((s) => {
      const next = { ...s, [to]: !s[to] };
      localStorage.setItem(GROUP_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleGroupClick(to: string) {
    if (collapsed) {
      setCollapsed(false);
      localStorage.setItem(COLLAPSE_KEY, "0");
      if (!openGroups[to]) toggleGroup(to);
      return;
    }
    toggleGroup(to);
  }

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
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
        className={`ad-sidebar fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-72"
        } ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center border-b ${
            collapsed ? "justify-center px-0" : "px-5 justify-between"
          }`}
          style={{ borderColor: "var(--ad-border)" }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "#3B82F6" }}
              >
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span
                className="font-bold text-[15px] truncate"
                style={{ color: "var(--ad-fg)" }}
              >
                Grocy
              </span>
            </div>
          )}
          <button
            className={`md:hidden shrink-0 ${collapsed ? "p-2 -mx-2" : ""}`}
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
          <button
            className="hidden md:block shrink-0"
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const groupOpen = openGroups[item.to] ?? true;
              const matchedChildren = item.children
                .map((c) => ({
                  child: c,
                  depth:
                    pathname === c.to
                      ? c.to.length + 1
                      : pathname.startsWith(c.to + "/")
                      ? c.to.length
                      : -1,
                }))
                .filter((m) => m.depth >= 0)
                .sort((a, b) => b.depth - a.depth);
              const activeChild = matchedChildren[0]?.child ?? null;
              const childActive = activeChild !== null;
              const active =
                collapsed && childActive
                  ? true
                  : pathname === item.to && !childActive;
              return (
                <div key={item.to}>
                  <button
                    onClick={() => handleGroupClick(item.to)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-md text-sm text-left relative transition-colors ${
                      active || childActive ? "font-bold" : "font-medium"
                    } ${
                      collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"
                    }`}
                    style={{
                      color: active ? "var(--ad-fg)" : "var(--ad-muted)",
                      background: active
                        ? "var(--ad-active-bg)"
                        : "transparent",
                    }}
                  >
                    <Icon size={17} />
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                        style={{ background: "#3B82F6" }}
                      />
                    )}
                    {!collapsed && (
                      <>
                        <span className="truncate min-w-0">{item.label}</span>
                        <ChevronDown
                          size={15}
                          className="ml-auto shrink-0 transition-transform"
                          style={{
                            color: "var(--ad-muted)",
                            transform: groupOpen
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                          }}
                        />
                      </>
                    )}
                  </button>

                  {!collapsed && groupOpen && (
                    <div
                      className="ml-5 pl-3 border-l space-y-0.5"
                      style={{ borderColor: "var(--ad-border)" }}
                    >
                      {item.children.map((child) => {
                        const active = activeChild?.to === child.to;
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
                            {active && (
                              <span
                                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                                style={{ background: "#3B82F6" }}
                              />
                            )}
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
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-md text-sm font-medium relative transition-colors ${
                  collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2"
                }`}
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
                {!collapsed && (
                  <span className="truncate min-w-0">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={`m-3 p-3 rounded-lg flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ background: "var(--ad-active-bg)" }}
        >
          <Avatar name={user?.name ?? "User"} size={36} />
          {!collapsed && (
            <div className="min-w-0">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--ad-fg)" }}
              >
                {user?.name ?? "User"}
              </div>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold mt-0.5"
                style={{
                  color: "#3B82F6",
                  background: "rgba(59,130,246,0.15)",
                }}
              >
                {user && user.is_customer ? "CUSTOMER" : "ADMIN"}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
