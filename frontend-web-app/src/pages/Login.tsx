import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/App.css";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";

export default function Login() {
  const { push } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      push("Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      push(err instanceof Error ? err.message : "Sign in failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="phone phone-page">
      <form onSubmit={handleSubmit} className="auth-card space-y-4">
        <div className="mb-2">
          <div className="brand">Grocy</div>
          <p className="text-sm text-[var(--ink-soft)] mt-3">
            Sign in to your account
          </p>
        </div>

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="kamu@email.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sign in…" : "Sign in"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => navigate("/")}
        >
          Back to Explore
        </Button>

        <p className="text-sm text-[var(--ink-soft)] text-center">
          Doesn't have account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[var(--moss-dark)]"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
