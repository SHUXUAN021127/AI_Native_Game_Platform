// 全站唯一的 API 地址来源。不再在各页面里写死 http://127.0.0.1:8000。
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
