import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

type Admin = Database["public"]["Tables"]["admins"]["Row"];

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setUser(data.user);
      setAdmin(data.admin);
    } catch (error) {
      console.error("Error fetching auth state:", error);
      setUser(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      setAdmin(data.admin);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setAdmin(null);

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, admin, loading, login, logout, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
