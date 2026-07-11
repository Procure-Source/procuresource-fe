"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  role: string;
  tags: string[];
  isVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    data: Record<string, unknown> | FormData,
  ) => Promise<{ requiresVerification?: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || "Login failed");
      (err as any).code = data.code;
      throw err;
    }
    setUser(data.user);
  };

  const register = async (formData: Record<string, unknown> | FormData) => {
    const isMultipart = formData instanceof FormData;
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: isMultipart ? undefined : { "Content-Type": "application/json" },
      body: isMultipart ? formData : JSON.stringify(formData),
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    // If email verification is required, don't set user — return the response
    if (data.requiresVerification) {
      return { requiresVerification: true, message: data.message };
    }

    // Fallback: if the API returns a user (shouldn't happen with new flow)
    if (data.user) {
      setUser(data.user);
    }
    return {};
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
