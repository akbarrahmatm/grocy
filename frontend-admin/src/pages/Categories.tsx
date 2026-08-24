import AdminShell from "@/components/layout/Adminshell";
import "@/App.css";

function Categories() {
  return (
    <AdminShell title="Categories">
      <div className="ad-card p-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ad-fg)" }}>
          Categories
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ad-muted)" }}>
          Organize products into categories.
        </p>
      </div>
    </AdminShell>
  );
}

export default Categories;