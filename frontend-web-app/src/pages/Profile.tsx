import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MapPin, Package } from "lucide-react";
import "@/App.css";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";

export default function Profile() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      push("Signed out successfully");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to sign out", "error");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="phone">
      <div className="section-label" style={{ paddingTop: 24 }}>
        <h2>Profile</h2>
      </div>

      <div className="profile-head">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <p className="profile-name">{user.name}</p>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="menu">
        <button className="menu-item" onClick={() => navigate("/orders")}>
          <span className="menu-icon">
            <Package size={17} />
          </span>
          <span className="menu-text">
            <span className="t">My Orders</span>
            <span className="s">Track purchases &amp; payments</span>
          </span>
          <span className="menu-arrow">›</span>
        </button>
        <button className="menu-item" onClick={() => navigate("/address")}>
          <span className="menu-icon">
            <MapPin size={17} />
          </span>
          <span className="menu-text">
            <span className="t">Address</span>
            <span className="s">Manage delivery addresses</span>
          </span>
          <span className="menu-arrow">›</span>
        </button>
        <button
          className="menu-item logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <span className="menu-icon">↩</span>
          <span className="menu-text">
            <span className="t">
              {loggingOut ? "Signing out…" : "Sign out"}
            </span>
          </span>
        </button>
      </div>

      <BottomNav active="profile" cartCount={count} />
    </div>
  );
}
