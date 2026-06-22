// 底层 HTTP 客户端：统一拼接 API 地址、自动带 token、统一报错。

import { getToken } from "@/lib/auth/token";
import { API_BASE_URL } from "@/lib/config";

export class ApiError extends Error {
  status: number;
  // 原始的后端 detail：可能是字符串，也可能是 FastAPI 422 的对象数组。
  // 上层（如注册页）据此翻译成用户看得懂的提示。
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
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
    finalBody = body;
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
    let detail: unknown = res.statusText;
    try {
      const data = await res.json();
      detail = data?.detail ?? res.statusText;
    } catch {
      // 响应不是 JSON
    }
    const message = typeof detail === "string" ? detail : res.statusText;
    throw new ApiError(res.status, message, detail);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${API_BASE_URL}${path}`;
}
