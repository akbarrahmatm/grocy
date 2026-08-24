import { useEffect, useState, type FormEvent } from "react";
import {
  AtSign,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Search,
  User,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import AdminShell from "@/components/layout/Adminshell";
import Field from "@/components/ui/Field";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/useToast";
import { userApi } from "@/lib/api";
import type { AuthUser } from "@/types";
import "@/App.css";

interface UsersProps {
  role?: "ADMIN" | "CUSTOMER";
}

function roleOf(user: AuthUser): "ADMIN" | "CUSTOMER" {
  return user.is_customer ? "CUSTOMER" : "ADMIN";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Users({ role }: UsersProps) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    next_page_url: null as string | null,
    prev_page_url: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCustomer, setIsCustomer] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await userApi.create({ name, email, password, is_customer: isCustomer });
      push(`${created.name} added (${created.is_customer ? "Customer" : "Admin"})`);
      setShowCreate(false);
      setPage(1);
      setReloadKey((k) => k + 1);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add user", "error");
    } finally {
      setCreating(false);
    }
  }

  function openCreate() {
    setIsCustomer(role === "CUSTOMER");
    setName("");
    setEmail("");
    setPassword("");
    setShowCreate(true);
  }

  useEffect(() => {
    let cancelled = false;
    userApi
      .list({
        role: role?.toLowerCase() as "admin" | "customer" | undefined,
        search: debouncedQuery.trim() || undefined,
        page,
      })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data);
        setMeta({
          current_page: res.current_page,
          last_page: res.last_page,
          per_page: res.per_page,
          total: res.total,
          next_page_url: res.next_page_url,
          prev_page_url: res.prev_page_url,
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, page, debouncedQuery, reloadKey]);

  function handleQueryChange(v: string) {
    setQuery(v);
    setPage(1);
  }

  const currentSlice = users;
  const noResultText = query.trim()
    ? "No users match your search."
    : "No users.";

  return (
    <AdminShell
      title={
        role === "ADMIN"
          ? "Admins"
          : role === "CUSTOMER"
          ? "Customers"
          : "Users"
      }
    >
      <div className="ad-card overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 mr-auto">
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--ad-active-bg)" }}
            >
              <UsersIcon size={17} style={{ color: "#3B82F6" }} />
            </span>
            <div>
              <h2
                className="font-bold leading-tight"
                style={{ color: "var(--ad-fg)" }}
              >
                {role === "ADMIN"
                  ? "Admins"
                  : role === "CUSTOMER"
                  ? "Customers"
                  : "Users"}
              </h2>
              <span className="text-xs" style={{ color: "var(--ad-muted)" }}>
                {meta.total} registered
              </span>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Field
              icon={Search}
              label=""
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by name, email, role…"
            />
          </div>

          <button onClick={openCreate} className="ad-btn">
            <Plus size={16} />
            Add User
          </button>
        </div>

        {loading ? (
          <div
            className="px-5 py-12 text-center text-sm"
            style={{ color: "var(--ad-muted)" }}
          >
            Loading users…
          </div>
        ) : error ? (
          <div
            className="px-5 py-12 text-center text-sm"
            style={{ color: "#DC2626" }}
          >
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left border-b"
                  style={{ color: "var(--ad-muted)", borderColor: "#CBD5E1" }}
                >
                  <th className="px-5 py-3 font-semibold text-[0.7rem] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3 font-semibold text-[0.7rem] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3 font-semibold text-[0.7rem] uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSlice.map((user) => (
                  <tr
                    key={user.id}
                    className="ad-row border-b last:border-b-0 transition-colors"
                    style={{ borderColor: "var(--ad-border)" }}
                  >
                    <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <div
                            className="font-semibold truncate"
                            style={{ color: "var(--ad-fg)" }}
                          >
                            {user.name}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: "var(--ad-muted)" }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide"
                        style={
                          roleOf(user) === "ADMIN"
                            ? {
                                color: "#3B82F6",
                                background: "rgba(59,130,246,0.12)",
                              }
                            : {
                                color: "#059669",
                                background: "rgba(16,185,129,0.12)",
                              }
                        }
                      >
                        {roleOf(user)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs"
                      style={{ color: "var(--ad-muted)" }}
                    >
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}

                {!currentSlice.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-12 text-center text-sm"
                      style={{ color: "var(--ad-muted)" }}
                    >
                      {noResultText}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div
              className="px-5 py-3 border-t flex items-center justify-between gap-3"
              style={{ borderColor: "var(--ad-border)" }}
            >
              <span className="text-xs" style={{ color: "var(--ad-muted)" }}>
                Page {meta.current_page} of {meta.last_page} · {meta.total}{" "}
                users
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.prev_page_url || page <= 1}
                  className="p-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ borderColor: "var(--ad-border)" }}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.next_page_url || page >= meta.last_page}
                  className="p-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ borderColor: "var(--ad-border)" }}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="ad-card w-full max-w-md p-6 ad-fade"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--ad-active-bg)" }}
              >
                <UserPlus size={17} style={{ color: "#3B82F6" }} />
              </span>
              <div>
                <h3 className="font-bold" style={{ color: "var(--ad-fg)" }}>
                  Add User
                </h3>
                <p className="text-xs" style={{ color: "var(--ad-muted)" }}>
                  Create a new account
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Field
                icon={User}
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Full name"
                autoComplete="off"
              />
              <Field
                icon={AtSign}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="user@example.com"
                autoComplete="off"
              />
              <Field
                icon={Lock}
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              {role ? (
                <div>
                  <span
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--ad-fg)" }}
                  >
                    Role
                  </span>
                  <div
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wide"
                    style={
                      role === "ADMIN"
                        ? {
                            color: "#3B82F6",
                            background: "rgba(59,130,246,0.12)",
                          }
                        : {
                            color: "#059669",
                            background: "rgba(16,185,129,0.12)",
                          }
                    }
                  >
                    {role}
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--ad-fg)" }}
                  >
                    Role
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomer(false)}
                      className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors"
                      style={{
                        color: isCustomer ? "var(--ad-muted)" : "#3B82F6",
                        background: isCustomer
                          ? "transparent"
                          : "rgba(59,130,246,0.10)",
                        borderColor: isCustomer
                          ? "var(--ad-border)"
                          : "#3B82F6",
                      }}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomer(true)}
                      className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors"
                      style={{
                        color: isCustomer ? "#059669" : "var(--ad-muted)",
                        background: isCustomer
                          ? "rgba(16,185,129,0.10)"
                          : "transparent",
                        borderColor: isCustomer ? "#059669" : "var(--ad-border)",
                      }}
                    >
                      Customer
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="ad-btn ad-btn-ghost flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="ad-btn flex-1 justify-center"
                >
                  <UserPlus size={16} />
                  {creating ? "Adding…" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default Users;
