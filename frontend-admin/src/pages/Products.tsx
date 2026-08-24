import AdminShell from "@/components/layout/Adminshell";
import "@/App.css";

function Products() {
  return (
    <AdminShell title="Products">
      <div className="ad-card p-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--ad-fg)" }}>
          Products
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--ad-muted)" }}>
          Manage your product catalog.
        </p>
      </div>
    </AdminShell>
  );
}

export default Products;