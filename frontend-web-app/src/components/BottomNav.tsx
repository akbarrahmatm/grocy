import { ChefHat, Compass, ShoppingCart, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavKey = "explore" | "recipes" | "cart" | "profile";

const NAV_ITEMS = [
  { key: "explore", label: "Explore", icon: Compass, path: "/" },
  { key: "recipes", label: "Recipes", icon: ChefHat, path: "/recipes" },
  { key: "cart", label: "Cart", icon: ShoppingCart, path: "/cart" },
  { key: "profile", label: "Profile", icon: User, path: "/profile" },
] as const;

function activeKey(pathname: string): NavKey {
  if (pathname.startsWith("/recipes")) return "recipes";
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/profile")) return "profile";
  return "explore";
}

interface BottomNavProps {
  active?: NavKey;
  cartCount: number;
}

export default function BottomNav({ active, cartCount }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const current: NavKey = active ?? activeKey(location.pathname);

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, label, icon: Icon, path }) => (
        <button
          key={key}
          className={`nav-item ${current === key ? "active" : ""}`}
          aria-current={current === key ? "page" : undefined}
          onClick={() => navigate(path)}
        >
          <Icon />
          {label}
          {key === "cart" && cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
