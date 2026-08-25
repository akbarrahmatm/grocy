import { Compass, ShoppingCart, User } from "lucide-react";

type NavKey = "explore" | "cart" | "profile";

const NAV_ITEMS = [
  { key: "explore", label: "Explore", icon: Compass },
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "profile", label: "Profile", icon: User },
] as const;

interface BottomNavProps {
  active: NavKey;
  cartCount: number;
}

export default function BottomNav({ active, cartCount }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`nav-item ${active === key ? "active" : ""}`}
          aria-current={active === key ? "page" : undefined}
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
