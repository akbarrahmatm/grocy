import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import ResourcePage, { type ResourceField } from "@/components/ui/ResourcePage";
import ActiveBadge from "@/components/ui/ActiveBadge";
import { categoryApi, productApi, uomApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types";

interface OptionItem {
  value: string;
  label: string;
}

function Products() {
  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [uomOptions, setUomOptions] = useState<OptionItem[]>([]);

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

  const fields: ResourceField[] = [
    { name: "name", label: "Name", icon: Package, placeholder: "Product name" },
    { name: "sku", label: "SKU", placeholder: "Optional SKU", optional: true },
    {
      name: "category_id",
      label: "Category",
      type: "select",
      options: categoryOptions,
    },
    {
      name: "uom_id",
      label: "Unit Of Measure",
      type: "select",
      options: uomOptions,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "0.00",
    },
    { name: "stock", label: "Stock", type: "number", readonly: true },
    {
      name: "description",
      label: "Description",
      placeholder: "Optional description",
      optional: true,
    },
    {
      name: "is_active",
      label: "Status",
      type: "switch",
      initial: "true",
    },
  ];

  return (
    <ResourcePage<Product>
      title="Products"
      singular="Product"
      icon={Package}
      searchPlaceholder="Search by name, SKU…"
      headers={["Product", "Category", "UOM", "Price", "Status", "Created"]}
      fields={fields}
      list={productApi.list}
      create={productApi.create}
      update={productApi.update}
      remove={productApi.remove}
      getId={(p) => p.id}
      renderRow={(p) => [
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
