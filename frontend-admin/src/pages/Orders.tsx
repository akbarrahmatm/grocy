import { ShoppingCart } from "lucide-react";
import ResourcePage from "@/components/ui/ResourcePage";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_COLORS: Record<Order["status"], { fg: string; bg: string }> = {
  pending: { fg: "#D97706", bg: "rgba(217,119,6,0.12)" },
  paid: { fg: "#16A34A", bg: "rgba(22,163,74,0.12)" },
  processing: { fg: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  completed: { fg: "#059669", bg: "rgba(5,150,105,0.12)" },
  cancelled: { fg: "#DC2626", bg: "rgba(220,38,38,0.12)" },
};

function StatusBadge({ status }: { status: Order["status"] }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] font-bold capitalize"
      style={{ color: c.fg, background: c.bg }}
    >
      {status}
    </span>
  );
}

function Orders() {
  return (
    <ResourcePage<Order>
      title="Orders"
      singular="Order"
      icon={ShoppingCart}
      searchPlaceholder="Search by order number…"
      headers={["Order", "Customer", "Items", "Total", "Status", "Created"]}
      fields={[]}
      list={orderApi.list}
      readOnly
      renderRow={(o) => [
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] font-bold"
          style={{ color: "#3B82F6", background: "rgba(59,130,246,0.12)" }}
        >
          {o.order_number}
        </span>,
        <div className="min-w-0">
          <div className="font-semibold truncate" style={{ color: "var(--ad-fg)" }}>
            {o.user?.name ?? `#${o.user_id}`}
          </div>
          <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>
            {o.user?.email ?? ""}
          </div>
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {o.items_count ?? o.items?.length ?? 0}
        </div>,
        <div className="font-semibold" style={{ color: "var(--ad-fg)" }}>
          {formatCurrency(o.total)}
        </div>,
        <StatusBadge status={o.status} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(o.created_at)}
        </div>,
      ]}
    />
  );
}

export default Orders;