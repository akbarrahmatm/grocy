import { Ruler, Type } from "lucide-react";
import ResourcePage, { type ResourceField } from "@/components/ui/ResourcePage";
import ActiveBadge from "@/components/ui/ActiveBadge";
import { uomApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Uom } from "@/types";

const FIELDS: ResourceField[] = [
  { name: "name", label: "Name", icon: Type, placeholder: "e.g. Kilogram" },
  { name: "code", label: "Code", icon: Ruler, placeholder: "e.g. kg" },
  { name: "is_active", label: "Status", type: "switch", icon: Ruler, initial: "true" },
];

function Uoms() {
  return (
    <ResourcePage<Uom>
      title="Unit Of Measure"
      singular="UOM"
      icon={Ruler}
      searchPlaceholder="Search by name, code…"
      headers={["Name", "Code", "Products", "Status", "Created"]}
      fields={FIELDS}
      list={uomApi.list}
      create={uomApi.create}
      update={uomApi.update}
      remove={uomApi.remove}
      getId={(u) => u.id}
      renderRow={(u) => [
        <div className="font-semibold" style={{ color: "var(--ad-fg)" }}>
          {u.name}
        </div>,
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] font-bold"
          style={{ color: "#3B82F6", background: "rgba(59,130,246,0.12)" }}
        >
          {u.code}
        </span>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {u.products_count ?? 0}
        </div>,
        <ActiveBadge active={u.is_active} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(u.created_at)}
        </div>,
      ]}
    />
  );
}

export default Uoms;