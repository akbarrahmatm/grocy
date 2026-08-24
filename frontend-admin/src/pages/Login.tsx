import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, Mail, ShoppingCart } from "lucide-react";
import "@/App.css";
import { authApi, saveSession } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import Field from "@/components/ui/Field";

function Login() {
  const { push } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await authApi.login(email, password);
      if (auth.user.is_customer) {
        push("Customer accounts cannot access the admin panel", "error");
        return;
      }
      saveSession(auth);
      push(`Welcome, ${auth.user.name}`);
      navigate("/", { replace: true });
    } catch (err) {
      push(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-root min-h-screen flex items-center justify-center px-4">
      <div className="ad-card w-full max-w-md p-8 ad-fade">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#3B82F6" }}
          >
            <ShoppingCart size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--ad-fg)" }}>
              Grocy Admin
            </h1>
            <p className="text-sm" style={{ color: "var(--ad-muted)" }}>
              Sign in to your account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            icon={Mail}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@example.com"
            autoComplete="email"
          />

          <Field
            icon={Lock}
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="ad-btn w-full justify-center"
          >
            <LogIn size={16} />
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;