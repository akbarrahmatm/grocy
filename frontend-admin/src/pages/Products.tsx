import { Package } from "lucide-react";
import ResourcePage from "@/components/ui/ResourcePage";
import ActiveBadge from "@/components/ui/ActiveBadge";
import { productApi } from "@/lib/api";
import { formatCurrency, formatDate, resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

function Products() {
  return (
    <ResourcePage<Product>
      title="Products"
      singular="Product"
      icon={Package}
      searchPlaceholder="Search by name, SKU…"
      headers={["Product", "Category", "UOM", "Price", "Status", "Created"]}
      list={productApi.list}
      remove={productApi.remove}
      getId={(p) => p.id}
      createHref="/products/create"
      editHref={(p) => `/products/edit/${p.id}`}
      renderRow={(p) => [
        <div className="flex items-center gap-3 min-w-0">
          {resolveImageUrl(p.thumbnail) ? (
            <img
              src={resolveImageUrl(p.thumbnail) ?? ""}
              alt={p.name}
              loading="lazy"
              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
              style={{ border: "1px solid var(--ad-border)" }}
            />
          ) : (
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "var(--ad-active-bg)", color: "var(--ad-muted)" }}
            >
              {p.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div
              className="font-semibold truncate"
              style={{ color: "var(--ad-fg)" }}
            >
              {p.name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--ad-muted)" }}
            >
              {p.sku}
            </div>
          </div>
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {p.category?.name ?? `#${p.category_id}`}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {p.uom?.name ?? `#${p.uom_id}`}
        </div>,
        <div className="font-semibold" style={{ color: "var(--ad-fg)" }}>
          {formatCurrency(p.price)}
        </div>,
        <ActiveBadge active={p.is_active} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(p.created_at)}
        </div>,
      ]}
    />
  );
}

export default Products;
