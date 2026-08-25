import { useEffect, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import ResourcePage, { type ResourceField } from "@/components/ui/ResourcePage";
import { productApi, stockAdjustmentApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Product, StockAdjustment } from "@/types";

interface OptionItem {
  value: string;
  label: string;
}

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

function StockAdjustment() {
  const [productOptions, setProductOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const first = await productApi.list();
      let items: Product[] = [...first.data];
      for (let p = 2; p <= first.last_page; p++) {
        const res = await productApi.list({ page: p });
        items = items.concat(res.data);
      }
      if (!cancelled)
        setProductOptions(
          items.map((pr) => ({
            value: String(pr.id),
            label: `${pr.name} (${pr.sku})`,
          }))
        );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fields: ResourceField[] = [
    { name: "product_id", label: "Product", type: "select", options: productOptions },
    {
      name: "type",
      label: "Type",
      type: "select",
      stringValues: true,
      options: [
        { value: "in", label: "Stock In (+)" },
        { value: "out", label: "Stock Out (-)" },
      ],
    },
    { name: "qty", label: "Quantity", type: "number", placeholder: "0" },
    { name: "note", label: "Note", placeholder: "Optional", optional: true },
  ];

  return (
    <ResourcePage<StockAdjustment>
      title="Stock Adjustment"
      singular="Adjustment"
      icon={ArrowDownUp}
      searchPlaceholder="Search by product, SKU…"
      headers={["Product", "SKU", "Type", "Qty", "Note", "Created"]}
      fields={fields}
      list={stockAdjustmentApi.list}
      create={stockAdjustmentApi.create}
      renderRow={(a) => [
        <div className="font-semibold" style={{ color: "var(--ad-fg)" }}>
          {a.product?.name ?? `#${a.product_id}`}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {a.product?.sku ?? "—"}
        </div>,
        <TypeBadge type={a.type} qty={a.qty} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {a.qty}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {a.note ?? "—"}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(a.created_at)}
        </div>,
      ]}
    />
  );
}

export default StockAdjustment;