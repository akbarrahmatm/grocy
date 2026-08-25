import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Package, X } from "lucide-react";
import AdminShell from "@/components/layout/Adminshell";
import Field from "@/components/ui/Field";
import { useToast } from "@/hooks/useToast";
import { categoryApi, productApi, uomApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

interface OptionItem {
  value: string;
  label: string;
}

interface ProductFormProps {
  id?: number;
}

export default function ProductForm({ id }: ProductFormProps) {
  const navigate = useNavigate();
  const { push } = useToast();
  const isEdit = typeof id === "number";

  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [uomOptions, setUomOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    uom_id: "",
    price: "",
    description: "",
    is_active: "true",
  });
  const [thumbnail, setThumbnail] = useState<File | null | undefined>(
    undefined
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(
    null
  );

  useEffect(() => {
    categoryApi.list().then((res) => {
      setCategoryOptions(
        res.data.map((c) => ({ value: String(c.id), label: c.name }))
      );
    });
    uomApi.list().then((res) => {
      setUomOptions(
        res.data.map((u) => ({
          value: String(u.id),
          label: `${u.name} (${u.code})`,
        }))
      );
    });
  }, []);

  useEffect(() => {
    if (!isEdit || typeof id !== "number") return;
    let cancelled = false;
    productApi
      .show(id)
      .then((p) => {
        if (cancelled) return;
        setForm({
          name: p.name,
          sku: p.sku ?? "",
          category_id: String(p.category_id),
          uom_id: String(p.uom_id),
          price: String(p.price),
          description: p.description ?? "",
          is_active: p.is_active ? "true" : "false",
        });
        setExistingThumbnail(p.thumbnail);
      })
      .catch((err) => {
        if (!cancelled) {
          push(
            err instanceof Error ? err.message : "Failed to load product",
            "error"
          );
          navigate("/products", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate, push]);

  function setField(name: keyof typeof form, value: string) {
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFilePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnail(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function clearFilePick() {
    setThumbnail(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  const shownPreview =
    previewUrl ??
    (thumbnail === null ? null : resolveImageUrl(existingThumbnail));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return push("Name is required", "error");
    if (!form.category_id) return push("Category is required", "error");
    if (!form.uom_id) return push("Unit Of Measure is required", "error");
    if (!form.price) return push("Price is required", "error");

    setSaving(true);
    try {
      const fd = new FormData();
      if (isEdit) fd.append("_method", "PUT");
      fd.append("name", form.name.trim());
      fd.append("category_id", form.category_id);
      fd.append("uom_id", form.uom_id);
      fd.append("price", form.price);
      if (form.sku.trim()) fd.append("sku", form.sku.trim());
      else fd.append("sku", "");
      if (form.description.trim())
        fd.append("description", form.description.trim());
      else fd.append("description", "");
      fd.append("is_active", form.is_active === "true" ? "1" : "0");
      if (thumbnail instanceof File) fd.append("thumbnail", thumbnail);
      else if (thumbnail === null || !isEdit) fd.append("thumbnail", "");

      if (isEdit && typeof id === "number") {
        await productApi.update(id, fd);
        push(`${form.name.trim()} updated`);
      } else {
        await productApi.create(fd);
        push(`${form.name.trim()} added`);
      }
      navigate("/products");
    } catch (err) {
      push(
        err instanceof Error ? err.message : `Failed to save product`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  const selectStyle = {
    background: "var(--ad-bg)",
    borderColor: "var(--ad-border)",
    color: "var(--ad-fg)",
  };

  return (
    <AdminShell title={isEdit ? "Edit Product" : "Create Product"}>
      <div className="ad-card w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--ad-active-bg)" }}
          >
            <Package size={17} style={{ color: "#3B82F6" }} />
          </span>
          <div>
            <h3 className="font-bold" style={{ color: "var(--ad-fg)" }}>
              {isEdit ? "Edit product" : "Add new product"}
            </h3>
            <p className="text-xs" style={{ color: "var(--ad-muted)" }}>
              {isEdit
                ? "Update the product details below."
                : "Fill in the details to create a product."}
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: "var(--ad-muted)" }}
          >
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={Package}
              label="Name"
              value={form.name}
              onChange={(v) => setField("name", v)}
              placeholder="Product name"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--ad-fg)" }}
                >
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setField("category_id", e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-md border text-sm outline-none appearance-none"
                  style={selectStyle}
                >
                  <option value="">Select Category…</option>
                  {categoryOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--ad-fg)" }}
                >
                  Unit Of Measure
                </label>
                <select
                  value={form.uom_id}
                  onChange={(e) => setField("uom_id", e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-md border text-sm outline-none appearance-none"
                  style={selectStyle}
                >
                  <option value="">Select Unit Of Measure…</option>
                  {uomOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="SKU"
                value={form.sku}
                onChange={(v) => setField("sku", v)}
                placeholder="Optional SKU"
              />
              <Field
                label="Price"
                type="number"
                value={form.price}
                onChange={(v) => setField("price", v)}
                placeholder="0.00"
              />
            </div>

            <Field
              label="Description"
              value={form.description}
              onChange={(v) => setField("description", v)}
              placeholder="Optional description"
            />

            <div>
              <span
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ad-fg)" }}
              >
                Thumbnail
              </span>
              <div className="flex items-center gap-3">
                {shownPreview ? (
                  <img
                    src={shownPreview}
                    alt="Thumbnail preview"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    style={{ border: "1px solid var(--ad-border)" }}
                  />
                ) : (
                  <span
                    className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "var(--ad-active-bg)",
                      color: "var(--ad-muted)",
                      border: "1px dashed var(--ad-border)",
                    }}
                  >
                    <ImagePlus size={18} />
                  </span>
                )}
                <label className="ad-btn ad-btn-ghost cursor-pointer">
                  <ImagePlus size={15} />
                  {shownPreview ? "Change" : "Upload image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFilePick}
                  />
                </label>
                {(shownPreview || thumbnail === null) && (
                  <button
                    type="button"
                    onClick={clearFilePick}
                    className="p-2 rounded-md border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ borderColor: "var(--ad-border)" }}
                    title="Remove thumbnail"
                  >
                    <X size={15} style={{ color: "#EF4444" }} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <span
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--ad-fg)" }}
              >
                Status
              </span>
              <div className="flex items-center gap-2">
                {[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ].map((opt) => {
                  const selected = form.is_active === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField("is_active", opt.value)}
                      className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors"
                      style={{
                        color: selected ? "#3B82F6" : "var(--ad-muted)",
                        background: selected
                          ? "rgba(59,130,246,0.10)"
                          : "transparent",
                        borderColor: selected ? "#3B82F6" : "var(--ad-border)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="ad-btn ad-btn-ghost flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ad-btn flex-1 justify-center"
              >
                {saving
                  ? "Saving…"
                  : isEdit
                  ? "Save changes"
                  : "Create product"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
