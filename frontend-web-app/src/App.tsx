import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";

const Explore = lazy(() => import("@/pages/Explore"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Cart = lazy(() => import("@/pages/Cart"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const OrderComplete = lazy(() => import("@/pages/OrderComplete"));
const Profile = lazy(() => import("@/pages/Profile"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const CreateAddress = lazy(() => import("@/pages/CreateAddress"));
const EditAddress = lazy(() => import("@/pages/EditAddress"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Loading() {
  return (
    <div className="phone flex items-center justify-center min-h-screen">
      <span className="brand">Grocy</span>
    </div>
  );
}

function GuestOnly({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <Register />
              </GuestOnly>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/recipes"
            element={
              <RequireAuth>
                <Recipes />
              </RequireAuth>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/complete" element={<OrderComplete />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address" element={<Addresses />} />
          <Route path="/address/new" element={<CreateAddress />} />
          <Route path="/address/edit/:id" element={<EditAddress />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;