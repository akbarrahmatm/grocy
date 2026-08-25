import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi, clearSession, getSessionUser, saveSession } from "@/lib/api";
import type { AuthUser } from "@/types";

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getSessionUser);

  async function login(email: string, password: string) {
    const auth = await authApi.login(email, password);
    saveSession(auth);
    setUser(auth.user);
  }

  async function register(name: string, email: string, password: string) {
    const auth = await authApi.register(name, email, password);
    saveSession(auth);
    setUser(auth.user);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}