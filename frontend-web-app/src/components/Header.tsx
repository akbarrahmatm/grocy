import { UserIcon } from "@/components/icons";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="brand">Grocy</div>
      <button
        className="icon-btn"
        aria-label="Profile"
        onClick={() => navigate("/profile")}
      >
        <UserIcon width={17} height={17} />
      </button>
    </header>
  );
}
