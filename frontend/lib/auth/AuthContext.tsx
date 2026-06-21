"use client";

// 全局登录状态。取代 Navbar 里 setInterval(checkLogin, 1000) 的每秒轮询：
// 改为挂载时读一次 + 监听 storage 事件（跨标签页同步）+ 登录/登出主动更新。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearToken,
  decodeToken,
  getToken,
  isExpired,
  setToken,
} from "@/lib/auth/token";
import type { AuthUser, Role } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromStorage = useCallback(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || isExpired(decoded)) {
      clearToken();
      setUser(null);
      return;
    }
    setUser(decoded);
  }, []);

  useEffect(() => {
    loadFromStorage();
    setLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") loadFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadFromStorage]);

  const login = useCallback((token: string, role: Role) => {
    setToken(token, role);
    setUser(decodeToken(token));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
