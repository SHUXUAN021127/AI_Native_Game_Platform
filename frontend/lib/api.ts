// 类型化的 API 端点。页面只调这些函数，不直接 fetch。

import { apiFetch } from "@/lib/http";
import type {
  CreateGamePayload,
  Game,
  Role,
  TokenResponse,
  UserPublic,
} from "@/lib/types";

// ---------- 认证 ----------
export const authApi = {
  login(email: string, password: string): Promise<TokenResponse> {
    // 后端用 OAuth2 表单（username/password），不是 JSON
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);
    return apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body,
      auth: false,
    });
  },

  register(
    email: string,
    password: string,
    role: Role
  ): Promise<UserPublic> {
    return apiFetch<UserPublic>("/auth/register", {
      method: "POST",
      body: { email, password, role },
      auth: false,
    });
  },
};

// ---------- 游戏 ----------
export const gamesApi = {
  list: () => apiFetch<Game[]>("/games/", { method: "GET" }),
  recent: () => apiFetch<Game[]>("/games/recent", { method: "GET" }),
  myGames: () => apiFetch<Game[]>("/games/my-games", { method: "GET" }),
  history: () => apiFetch<Game[]>("/games/history", { method: "GET" }),
  get: (id: number | string) =>
    apiFetch<Game>(`/games/${id}`, { method: "GET" }),
  create: (payload: CreateGamePayload) =>
    apiFetch<Game>("/games/", { method: "POST", body: payload }),
  play: (id: number | string) =>
    apiFetch<{ play_count: number }>(`/games/${id}/play`, {
      method: "POST",
      auth: false,
    }),
  like: (id: number | string) =>
    apiFetch<{ liked: boolean }>(`/games/${id}/like`, { method: "POST" }),
  favorite: (id: number | string) =>
    apiFetch<{ favorited: boolean }>(`/games/${id}/favorite`, {
      method: "POST",
    }),
  retry: (id: number | string) =>
    apiFetch<Game>(`/games/${id}/retry`, { method: "POST" }),
  remove: (id: number | string) =>
    apiFetch<{ message: string }>(`/games/${id}`, { method: "DELETE" }),
};

// ---------- 上传 ----------
export const uploadApi = {
  file: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<{ filename: string; url: string }>("/upload/", {
      method: "POST",
      body: fd,
    });
  },
};

// 向后兼容：旧首页仍 `import { getGames } from "../lib/api"`
export function getGames(): Promise<Game[]> {
  return gamesApi.list();
}
