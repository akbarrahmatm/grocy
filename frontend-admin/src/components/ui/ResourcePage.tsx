import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, type LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import AdminShell from "@/components/layout/Adminshell";
import Field from "@/components/ui/Field";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/useToast";
import "@/App.css";
import type { Paginated } from "@/types";

export interface ResourceField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "select" | "switch";
  placeholder?: string;
  icon?: LucideIcon;
  options?: { value: string; label: string }[];
  initial?: string;
  optional?: boolean;
  readonly?: boolean;
  stringValues?: boolean;
}

interface OptionItem {
  value: string;
  label: string;
}

interface ResourcePageProps<T> {
  title: string;
  singular: string;
  icon: LucideIcon;
  searchPlaceholder: string;
  headers: string[];
  fields: ResourceField[];
  renderRow: (item: T) => ReactNode[];
  list: (opts: { search?: string; page?: number }) => Promise<Paginated<T>>;
  create?: (payload: Record<string, unknown>) => Promise<unknown>;
  update?: (id: number, payload: Record<string, unknown>) => Promise<{ name?: string }>;
  remove?: (id: number) => Promise<unknown>;
  getId?: (item: T) => number;
  selectOptions?: Record<string, OptionItem[]>;
  emptyText?: string;
  readOnly?: boolean;
}

export default function ResourcePage<T>({
  title,
  singular,
  icon: Icon,
  searchPlaceholder,
  headers,
  fields,
  renderRow,
  list,
  create,
  update,
  remove,
  getId,
  selectOptions = {},
  emptyText = "No records.",
  readOnly = false,
}: ResourcePageProps<T>) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
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

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showActions = Boolean(update && remove && getId) && !readOnly;

  function valueOf(item: T, name: string): string {
    const v = (item as unknown as Record<string, unknown>)[name];
    if (typeof v === "boolean") return v ? "true" : "false";
    return v === null || v === undefined ? "" : String(v);
  }

  useEffect(() => {
    let cancelled = false;
    list({ search: debouncedQuery.trim() || undefined, page })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
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
          setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, reloadKey]);

  function openCreate() {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.name] = f.initial ?? "";
    setForm(initial);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(item: T) {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.name] = valueOf(item, f.name);
    setForm(initial);
    setEditingId(getId!(item));
    setShowModal(true);
  }

  function setField(name: string, value: string) {
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.optional || f.type === "switch" || f.type === "select" || f.readonly) continue;
      if (!form[f.name]) {
        push(`${f.label} is required`, "error");
        return;
      }
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        if (f.readonly) continue;
        const v = form[f.name] ?? "";
        if (f.type === "switch") payload[f.name] = v === "true";
        else if (f.type === "number") payload[f.name] = v === "" ? undefined : Number(v);
        else if (f.type === "select") payload[f.name] = f.stringValues ? (v || undefined) : v ? Number(v) : undefined;
        else payload[f.name] = v || undefined;
      }
      if (editingId !== null && update && getId) {
        const updated = await update(editingId, payload);
        push(`${updated.name ?? singular} updated`);
      } else if (create) {
        const created = await create(payload) as { name?: string } | undefined;
        push(`${created?.name ?? singular} added`);
      }
      setShowModal(false);
      setEditingId(null);
      setPage(1);
      setReloadKey((k) => k + 1);
    } catch (err) {
      push(err instanceof Error ? err.message : `Failed to save ${singular.toLowerCase()}`, "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (deleteTarget === null || !remove) return;
    setDeleting(true);
    try {
      await remove(deleteTarget);
      push(`${singular} deleted`);
      setDeleteTarget(null);
      setPage(1);
      setReloadKey((k) => k + 1);
    } catch (err) {
      push(err instanceof Error ? err.message : `Failed to delete ${singular.toLowerCase()}`, "error");
    } finally {
      setDeleting(false);
    }
  }

  const noResultText = query.trim() ? "No records match your search." : emptyText;

  return (
    <AdminShell title={title}>
      <div className="ad-card overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 mr-auto">
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--ad-active-bg)" }}
            >
              <Icon size={17} style={{ color: "#3B82F6" }} />
            </span>
            <div>
              <h2
                className="font-bold leading-tight"
                style={{ color: "var(--ad-fg)" }}
              >
                {title}
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
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
            />
          </div>

          {!readOnly && (
            <button onClick={openCreate} className="ad-btn">
              <Plus size={16} />
              Add {singular}
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--ad-muted)" }}>
            Loading…
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "#DC2626" }}>
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
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 font-semibold text-[0.7rem] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                  {showActions && (
                    <th className="px-5 py-3 font-semibold text-[0.7rem] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="ad-row border-b last:border-b-0 transition-colors"
                    style={{ borderColor: "var(--ad-border)" }}
                  >
                    {renderRow(item).map((cell, j) => (
                      <td key={j} className="px-5 py-3.5">
                        {cell}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            title={`Edit ${singular}`}
                          >
                            <Pencil size={15} style={{ color: "#3B82F6" }} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(getId!(item))}
                            className="p-1.5 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            title={`Delete ${singular}`}
                          >
                            <Trash2 size={15} style={{ color: "#EF4444" }} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {!items.length && (
                  <tr>
                    <td
                      colSpan={headers.length + (showActions ? 1 : 0)}
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
                records
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

      {!readOnly && showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => { setShowModal(false); setEditingId(null); }}
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
                <Icon size={17} style={{ color: "#3B82F6" }} />
              </span>
              <div>
                <h3 className="font-bold" style={{ color: "var(--ad-fg)" }}>
                  {editingId !== null ? `Edit ${singular}` : `Add ${singular}`}
                </h3>
                <p className="text-xs" style={{ color: "var(--ad-muted)" }}>
                  {editingId !== null ? "Update the record" : "Create a new record"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((f) => {
                if (f.readonly) {
                  return (
                    <div key={f.name}>
                      <span
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--ad-fg)" }}
                      >
                        {f.label}
                      </span>
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={form[f.name] ?? ""}
                        disabled
                        className="w-full px-3 py-2.5 rounded-md border text-sm outline-none cursor-not-allowed"
                        style={{
                          background: "var(--ad-active-bg)",
                          borderColor: "var(--ad-border)",
                          color: "var(--ad-muted)",
                        }}
                      />
                    </div>
                  );
                }
                if (f.type === "switch") {
                  const opts =
                    f.options ?? [
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ];
                  return (
                    <div key={f.name}>
                      <span
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--ad-fg)" }}
                      >
                        {f.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {opts.map((opt) => {
                          const selected =
                            (form[f.name] ?? f.initial ?? "true") === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setField(f.name, opt.value)}
                              className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors"
                              style={{
                                color: selected
                                  ? "#3B82F6"
                                  : "var(--ad-muted)",
                                background: selected
                                  ? "rgba(59,130,246,0.10)"
                                  : "transparent",
                                borderColor: selected
                                  ? "#3B82F6"
                                  : "var(--ad-border)",
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (f.type === "select") {
                  return (
                    <div key={f.name}>
                      <span
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--ad-fg)" }}
                      >
                        {f.label}
                      </span>
                      <div className="relative">
                        <select
                          value={form[f.name] ?? ""}
                          onChange={(e) => setField(f.name, e.target.value)}
                          className="w-full pl-3 pr-9 py-2.5 rounded-md border text-sm outline-none appearance-none"
                          style={{
                            background: "var(--ad-bg)",
                            borderColor: "var(--ad-border)",
                            color: "var(--ad-fg)",
                          }}
                        >
                          <option value="">Select {f.label}…</option>
                          {(selectOptions[f.name] ?? f.options ?? []).map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 [color:var(--ad-muted)] pointer-events-none"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <Field
                    key={f.name}
                    label={f.label}
                    type={f.type}
                    value={form[f.name] ?? ""}
                    onChange={(v) => setField(f.name, v)}
                    placeholder={f.placeholder}
                  />
                );
              })}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="ad-btn ad-btn-ghost flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="ad-btn flex-1 justify-center"
                >
                  {creating
                    ? "Saving…"
                    : editingId !== null
                      ? `Save ${singular}`
                      : `Add ${singular}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="ad-card w-full max-w-sm p-6 ad-fade"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.10)" }}
              >
                <Trash2 size={17} style={{ color: "#EF4444" }} />
              </span>
              <div>
                <h3 className="font-bold" style={{ color: "var(--ad-fg)" }}>
                  Delete {singular}?
                </h3>
                <p className="text-xs" style={{ color: "var(--ad-muted)" }}>
                  This can't be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="ad-btn ad-btn-ghost flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ad-btn ad-btn-danger flex-1 justify-center"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}