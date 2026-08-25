import { UserIcon } from "@/components/icons";

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark">🌾</span>
        Grocy
      </div>
      <button className="icon-btn" aria-label="Profile">
        <UserIcon width={17} height={17} />
      </button>
    </header>
  );
}