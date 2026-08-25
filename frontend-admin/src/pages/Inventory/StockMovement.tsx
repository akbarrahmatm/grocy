import { History } from "lucide-react";
import ResourcePage from "@/components/ui/ResourcePage";
import { stockMovementApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { StockMovement } from "@/types";

function TypeBadge({ type, qty }: { type: "in" | "out"; qty: number }) {
  const isIn = type === "in";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] font-bold"
      style={{
        color: isIn ? "#16A34A" : "#DC2626",
        background: isIn ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
      }}
    >
      {isIn ? `+${qty}` : `-${qty}`}
    </span>
  );
}

function StockMovementPage() {
  return (
    <ResourcePage<StockMovement>
      title="Stock Movement"
      singular="Movement"
      icon={History}
      searchPlaceholder="Search by product, SKU…"
      headers={["Product", "SKU", "Type", "Qty", "Reference", "Note", "Created"]}
      fields={[]}
      list={stockMovementApi.list}
      readOnly
      renderRow={(m) => [
        <div className="font-semibold" style={{ color: "var(--ad-fg)" }}>
          {m.product?.name ?? `#${m.product_id}`}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {m.product?.sku ?? "—"}
        </div>,
        <TypeBadge type={m.type} qty={m.qty} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {m.qty}
        </div>,
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] font-bold"
          style={{ color: "#3B82F6", background: "rgba(59,130,246,0.12)" }}
        >
          {m.ref_type ? `${m.ref_type}${m.ref_id != null ? ` #${m.ref_id}` : ""}` : "—"}
        </span>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {m.note ?? "—"}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(m.created_at)}
        </div>,
      ]}
    />
  );
}

export default StockMovementPage;