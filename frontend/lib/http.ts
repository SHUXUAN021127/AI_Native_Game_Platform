// 底层 HTTP 客户端：统一拼接 API 地址、自动带 token、统一报错。
// 上层 lib/api.ts 的所有请求都走这里。

import { getToken } from "@/lib/auth/token";
import { API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  // 是否自动附带 Authorization 头，默认 true；登录/注册等设为 false
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData || body instanceof URLSearchParams) {
    finalBody = body; // 让浏览器自己设 Content-Type
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data?.detail ?? detail;
    } catch {
      // 响应不是 JSON，保留 statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// 把后端返回的相对路径（/covers/x.png、/games-files/x.html）拼成完整地址，
// 取代各页面里的 `http://127.0.0.1:8000${path}` 写死拼接。
export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${API_BASE_URL}${path}`;
}
