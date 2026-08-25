import { Link } from "react-router-dom";
import "@/App.css";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="phone phone-page">
      <div className="auth-card text-center">
        <h1 className="brand justify-center mt-3">Page not found</h1>
        <Link to="/" className="block mt-5">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    </div>
  );
}