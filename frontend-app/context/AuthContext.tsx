import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authApi,
  clearSession,
  getSessionUser,
  initSession,
  saveSession,
} from "@/lib/api";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent initialization from hanging the app indefinitely if the network is extremely slow
    const initTimeout = new Promise((resolve) => setTimeout(resolve, 3000));
    
    Promise.race([
      initSession(),
      initTimeout.then(() => ({ token: null, user: null }))
    ])
      .then((sessionData) => {
        const { user: storedUser, token } = sessionData || { token: null, user: null };
        if (token) {
          if (storedUser) setUser(storedUser);
          
          // Verify session in background without blocking app rendering
          authApi
            .me()
            .then(setUser)
            .catch(() => {
              clearSession();
              setUser(null);
            });
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    await saveSession(res);
    setUser(res.user);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await authApi.register(name, email, pass);
    await saveSession(res);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      await clearSession();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
