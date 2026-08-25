import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/App.css";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";

export default function Register() {
  const { push } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameValid = name.trim().length > 1;
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passValid = password.length >= 8;
  const matchValid = confirm.length > 0 && confirm === password;
  const canSubmit = nameValid && emailValid && passValid && matchValid;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      await register(name.trim(), email, password);
      push("Welcome to Grocy! Account created.");
      navigate("/", { replace: true });
    } catch (err) {
      push(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="phone phone-page">
      <form onSubmit={handleSubmit} className="auth-card space-y-4" noValidate>
        <div className="mb-2">
          <div className="brand">Grocy</div>
          <p className="text-sm text-[var(--ink-soft)] mt-3">
            Create an account to save your addresses and orders.
          </p>
        </div>

        <Field
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Your name"
          autoComplete="name"
          error={touched && !nameValid ? "Enter your full name." : undefined}
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@email.com"
          autoComplete="email"
          error={touched && !emailValid ? "Enter a valid email address." : undefined}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={touched && !passValid ? "Password must be at least 8 characters." : undefined}
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={touched && !matchValid ? "Passwords do not match." : undefined}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-sm text-[var(--ink-soft)] text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--moss-dark)]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
