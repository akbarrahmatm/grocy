import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ShieldBan } from "lucide-react";
import { clearSession, getSessionUser, isAuthenticated } from "@/lib/api";

const Index = lazy(() => import("@/pages/Index"));
const Products = lazy(() => import("@/pages/Products"));
const Categories = lazy(() => import("@/pages/Categories"));
const Users = lazy(() => import("@/pages/Users"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="ad-card px-4 py-2 text-sm">Loading…</div>
    </div>
  );
}

function Forbidden() {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="ad-root min-h-screen flex items-center justify-center px-4">
      <div className="ad-card w-full max-w-md p-8 ad-fade text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#EF4444" }}
        >
          <ShieldBan size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: "var(--ad-fg)" }}>
          Admin access only
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--ad-muted)" }}>
          Customer accounts cannot access the admin panel.
        </p>
        <button onClick={handleLogout} className="ad-btn w-full mt-6">
          Sign in with another account
        </button>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getSessionUser();
  if (user?.is_customer) return <Forbidden />;
  return children;
}

function GuestOnly({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
          <Route
            path="/products"
            element={
              <RequireAuth>
                <Products />
              </RequireAuth>
            }
          />
          <Route
            path="/categories"
            element={
              <RequireAuth>
                <Categories />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <Users />
              </RequireAuth>
            }
          />
          <Route
            path="/users/admin"
            element={
              <RequireAuth>
                <Users role="ADMIN" />
              </RequireAuth>
            }
          />
          <Route
            path="/users/customer"
            element={
              <RequireAuth>
                <Users role="CUSTOMER" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;