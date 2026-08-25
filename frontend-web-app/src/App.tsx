import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";

const Explore = lazy(() => import("@/pages/Explore"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Loading() {
  return (
    <div className="phone flex items-center justify-center min-h-screen">
      <span className="text-2xl">🌾</span>
    </div>
  );
}

function GuestOnly({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;