import { Link } from "react-router-dom";
import "@/App.css";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-lg text-slate-600">Sorry, page is not found.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
