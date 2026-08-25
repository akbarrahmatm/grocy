import { Package } from "lucide-react";
import ResourcePage from "@/components/ui/ResourcePage";
import ActiveBadge from "@/components/ui/ActiveBadge";
import { productApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

function Stock() {
  return (
    <ResourcePage<Product>
      title="Stock"
      singular="Stock"
      icon={Package}
      searchPlaceholder="Search by name, SKU…"
      headers={["Product", "Category", "UOM", "Stock", "Price", "Status", "Created"]}
      fields={[]}
      list={productApi.list}
      readOnly
      renderRow={(p) => [
        <div className="min-w-0">
          <div className="font-semibold truncate" style={{ color: "var(--ad-fg)" }}>
            {p.name}
          </div>
          <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>
            {p.sku}
          </div>
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {p.category?.name ?? `#${p.category_id}`}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {p.uom?.name ?? `#${p.uom_id}`}
        </div>,
        <div
          className="font-semibold"
          style={{ color: p.stock <= 0 ? "#EF4444" : "var(--ad-fg)" }}
        >
          {p.stock}
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

export default Stock;