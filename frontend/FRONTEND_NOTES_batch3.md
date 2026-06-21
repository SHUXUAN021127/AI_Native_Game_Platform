# 前端重构 · 第 3 批（地基）说明

## 新增 / 改动的文件
```
frontend/
├── .env.local.example      ← 新增：复制成 .env.local
├── app/layout.tsx          ← 改：包上 <AuthProvider>
├── components/Navbar.tsx    ← 改：用 useAuth，删掉每秒轮询
└── lib/
    ├── config.ts           ← 新增：API 地址唯一来源
    ├── types.ts            ← 新增：Game / Role / 等类型
    ├── http.ts             ← 新增：fetch 封装（自动带 token + 统一报错）
    ├── api.ts              ← 改：类型化端点（authApi/gamesApi/uploadApi）
    └── auth/
        ├── token.ts        ← 新增：token 存取 + JWT 解析
        └── AuthContext.tsx ← 新增：全局登录状态 + useAuth
```

## 配置
```bash
cp .env.local.example .env.local   # 按需改 NEXT_PUBLIC_API_BASE_URL
```

## 这一批解决了什么
- **写死的地址**：`http://127.0.0.1:8000` 不再散落各处，统一在 `lib/config.ts`，
  由环境变量控制。部署换域名只改 `.env.local`。
- **手动带 token**：以前每个请求都 `localStorage.getItem("token")` + 手拼
  `Authorization` 头。现在 `lib/http.ts` 自动带，页面不用管。
- **any 满天飞**：`lib/types.ts` 给出与后端对应的类型。
- **每秒轮询**：Navbar 原本 `setInterval(checkLogin, 1000)` 一直跑。换成
  `AuthContext`——挂载读一次 + 监听 storage 事件（跨标签页同步）+ 登录/登出
  主动更新。

## 怎么用（给第 4 批改页面时参考）
```ts
import { gamesApi } from "@/lib/api";
import { assetUrl } from "@/lib/http";
import { useAuth } from "@/lib/auth/AuthContext";

const games = await gamesApi.list();          // 已是 Game[]
const cover = assetUrl(game.cover_url);        // 拼完整地址
const { isAuthenticated, login, logout } = useAuth();
```
登录页拿到 token 后调 `login(data.access_token, data.role)`，不用再自己写
localStorage 和 `window.location.href`。

## 注意
- `NEXT_PUBLIC_` 变量是**构建期**注入的，改了要重启 dev server / 重新构建。
- 旧的 `getGames()` 仍保留，所以现有首页在第 4 批之前照常能跑。
- 第 4 批会：重写 6 个页面改用上面这套；抽出 `GameCard` 等复用组件；
  修首页重复 useEffect、把 my-games 里 `game.file_url`（后端不返回这个字段）
  改成 `play_url`；登录/注册改用 `useAuth` 和 ApiError 提示。
```
```
