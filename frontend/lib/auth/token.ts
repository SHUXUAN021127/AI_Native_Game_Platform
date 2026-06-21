// token 的单一存取点：API 客户端和 AuthContext 都用这里，避免各写一套。

import type { AuthUser, Role } from "@/lib/types";

const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, role: Role): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// 仅解析 JWT 载荷用于展示（用户名、角色）。注意：客户端解析不等于校验，
// 真正的鉴权永远以后端为准。
export function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      sub: String(payload.sub),
      email: payload.email ?? null,
      role: payload.role as Role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isExpired(user: AuthUser | null): boolean {
  if (!user?.exp) return false;
  return user.exp * 1000 < Date.now();
}
