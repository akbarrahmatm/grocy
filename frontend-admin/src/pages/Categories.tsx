import { FileText, Tag } from "lucide-react";
import ResourcePage, { type ResourceField } from "@/components/ui/ResourcePage";
import ActiveBadge from "@/components/ui/ActiveBadge";
import { categoryApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types";

const FIELDS: ResourceField[] = [
  { name: "name", label: "Name", icon: Tag, placeholder: "Category name" },
  { name: "slug", label: "Slug", icon: Tag, placeholder: "Optional slug", optional: true },
  {
    name: "description",
    label: "Description",
    icon: FileText,
    placeholder: "Optional description",
    optional: true,
  },
  { name: "is_active", label: "Status", type: "switch", icon: Tag, initial: "true" },
];

function Categories() {
  return (
    <ResourcePage<Category>
      title="Categories"
      singular="Category"
      icon={Tag}
      searchPlaceholder="Search by name, slug…"
      headers={["Name", "Description", "Products", "Status", "Created"]}
      fields={FIELDS}
      list={categoryApi.list}
      create={categoryApi.create}
      update={categoryApi.update}
      remove={categoryApi.remove}
      getId={(c) => c.id}
      renderRow={(c) => [
        <div className="min-w-0">
          <div className="font-semibold truncate" style={{ color: "var(--ad-fg)" }}>
            {c.name}
          </div>
          <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>
            {c.slug}
          </div>
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {c.description ?? "—"}
        </div>,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {c.products_count ?? 0}
        </div>,
        <ActiveBadge active={c.is_active} />,
        <div className="text-xs" style={{ color: "var(--ad-muted)" }}>
          {formatDate(c.created_at)}
        </div>,
      ]}
    />
  );
}

export default Categories;