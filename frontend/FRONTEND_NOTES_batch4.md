# 前端重构 · 第 4 批（页面 + 组件）说明

> 依赖第 3 批：先把第 3 批的 `lib/`、`AuthProvider`、Navbar 应用上，再覆盖这一批。

## 文件清单
```
frontend/
├── lib/
│   ├── theme.ts         ← 新增：设计令牌（渐变/颜色/阴影/状态色集中）
│   └── hooks.ts         ← 新增：usePolledGame（生成中自动轮询）
├── components/
│   ├── GameCard.tsx     ← 新增：首页 / my-games 复用卡片
│   ├── StatusBadge.tsx  ← 新增：状态胶囊
│   ├── GameLogs.tsx     ← 新增：agent 日志渲染
│   └── TagList.tsx      ← 改：用令牌，prop 接受 string | null
└── app/
    ├── page.tsx              ← 改：首页
    ├── login/page.tsx        ← 改
    ├── register/page.tsx     ← 改
    ├── my-games/page.tsx     ← 改
    ├── history/page.tsx      ← 改
    ├── game/[id]/page.tsx    ← 改
    └── create/page.tsx       ← 改
```

## 这一批做的事
- **7 个页面全部改用第 3 批的客户端**：不再有写死的 `127.0.0.1`、手拼
  `Authorization`、`localStorage` 读 token。统一走 `gamesApi` / `authApi` /
  `uploadApi` + `useAuth`。
- **抽公共组件**：`GameCard` 同时给首页和 my-games 用；`StatusBadge`、
  `GameLogs` 替换四处重复的状态三元和日志渲染。
- **设计令牌**：到处复制的渐变/阴影/颜色收进 `lib/theme.ts`，以后换肤改一处。

## 顺手修掉的 bug
1. **首页重复 useEffect**：原来两个 effect、`loadGames()` 被调两次；合并成一个。
2. **recentGames 拉了不渲染**：首页新增「Recently added」区真正展示。
3. **my-games 的 Play 打开 `/games-files/undefined`**：原用 `game.file_url`
   （后端不返回该字段），改成 `play_url`。
4. **create 页假进度**：原来用 `setTimeout` 演了一段假的 agent 日志，跟真实
   生成无关。现在创建后 `usePolledGame` 轮询后端真实状态，展示真实
   `generation_logs`，COMPLETED 才出 Play。
5. **注册能选 Admin**：后端已禁止自助注册 admin，前端去掉该选项（否则会 422）。
6. **错误用 alert()**：改成内联错误提示，文案面向用户（"Email or password is
   incorrect." 等）。
7. **登录/退出用 window.location.href 硬跳**：改用 `useAuth` + router。

## 注意
- 我没法 `npm install` / 跑 `tsc`，这批是手工保证类型自洽，请本地
  `npm run build` 过一遍。
- create 页的文档/图片/视频上传仅做了「带鉴权 + 报错」的修复，没有把上传结果
  接进游戏生成（原本也没接）——要做成「用上传素材生成」是个新功能，可另开。
- 这是四批里的最后一批。前后端整体重构到此完成。
