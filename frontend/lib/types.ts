// 与后端 schemas 对应的前端类型，取代满天飞的 any。

export type Role = "player" | "creator" | "admin";

export type GameStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export interface Game {
  id: number;
  title: string;
  description: string | null;
  status: GameStatus;
  author: string | null;
  tags: string | null;
  cover_url: string | null;
  play_count: number;
  like_count: number;
  favorite_count: number;
  liked: boolean;
  favorited: boolean;
  created_at: string | null;
  play_url: string | null;
  generation_logs: string | null;
}

export interface UserPublic {
  id: number;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: Role;
}

// 从 JWT 里解出来的当前用户
export interface AuthUser {
  sub: string;
  email: string | null;
  role: Role;
  exp?: number;
}

export interface CreateGamePayload {
  title: string;
  description: string;
}
