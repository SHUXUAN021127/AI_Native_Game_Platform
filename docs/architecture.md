# 架构设计

## 总体

前后端分离：

- **前端** Next.js（App Router）——页面渲染、调用后端 REST API。
- **后端** FastAPI——REST API + 静态托管生成的游戏/封面 + 多 Agent 生成流水线。
- **数据库** SQLite（可切 Postgres），SQLAlchemy 2.0 ORM。

## 后端分层

```
config.py          配置层（pydantic-settings，唯一配置来源）
database/db.py     引擎 / Session / Base / get_db
models/            ORM 模型（User, Game, GameLike, GameFavorite）
schemas/           Pydantic 模型（请求校验 + 响应序列化）
routers/           路由层（只收参数、调 service、返回）
services/          业务逻辑层
  ├── auth_service.py      密码哈希、JWT、依赖（get_current_user / require_roles）
  ├── game_service.py      游戏 CRUD、点赞收藏、后台生成编排、序列化
  ├── admin_service.py     用户管理（含"不能修改/删除 admin"规则）
  ├── game_generator.py    生成流水线编排
  ├── screenshot_service.py Cover Agent 的浏览器驱动 + 截图
  └── agents/              planner / generator / reviewer / tagger / cover
```

路由很薄，业务都在 service 层，便于测试与扩展。

## 生成流水线（多 Agent）

`POST /games/` 触发，整条在**后台任务**里跑：

1. **Planner**（`agents/planner.py`）——把用户描述包装成结构化的生成需求。
2. **Generator**（`agents/generator.py`）——调模型，输出两段：
   - 完整 standalone HTML 游戏；
   - 一行控制说明 JSON（`start` / `keys` / `notes`）。
   用 `===HTML===` / `===CONTROLS===` 分隔符分两段，避免大段 HTML 被 JSON 转义破坏。
   模型没按格式输出时，整段当 HTML、控制说明置空（下游自动降级）。
3. **Reviewer**（`agents/reviewer.py`）——基础校验（含必要标签）。不过则置 `FAILED`。
4. **Tagger**（`agents/tagger.py`）——生成 3-5 个英文标签。
5. **Cover Agent**（见下）——生成封面。

## 异步生成流程

```
前端 POST /games/  ──►  后端建记录(status=GENERATING) ──► 立即返回 202 + game.id
                                  │（后台任务）
                                  ▼
                     运行流水线，更新 generation_logs
                                  │
                          成功 → COMPLETED / 失败 → FAILED
前端轮询 GET /games/{id} ──► 看到状态变化后展示
```

请求线程不被生成阻塞；后台任务使用**独立的数据库 Session**（不复用已关闭的请求 Session）。

## Cover Agent（核心亮点）

目标：用**进行中**的真实游戏画面当封面，而不是初始/暂停/失败屏。

1. 无头 Chromium 用 `file://` 加载生成的 HTML，立刻截一张**初始帧**（永远兜底）。
2. **尝试启动并驱动游戏**：
   - 若 Generator 给了控制说明 → 按 `start` 开始、循环 `keys` 精确操作；
   - 否则**盲敲常用键**（Enter/Space/方向键/WASD）兜底。
3. 在 `COVER_TIMEOUT_SECONDS`（默认 10s）总预算内边操作边连拍多帧。
4. **选帧**（`agents/cover.py`）：用与初始帧的画面差异（Pillow）打分，差异最大的帧
   最可能是进行中画面；若都与初始帧相近（没玩起来）则用初始帧。

容器内运行 Chromium 需 `--no-sandbox --disable-dev-shm-usage` 启动参数。

## 前端结构

```
app/         页面（home / create / game[id] / history / login / register / my-games / admin）
components/   GameCard, StatusBadge, GameLogs, TagList, Navbar
lib/
  ├── config.ts   API 地址（来自 NEXT_PUBLIC_API_BASE_URL）
  ├── types.ts    与后端对应的类型
  ├── http.ts     fetch 封装（自动带 token、统一 ApiError、assetUrl）
  ├── api.ts      authApi / gamesApi / uploadApi / adminApi
  ├── theme.ts    设计令牌
  ├── hooks.ts    usePolledGame（生成中自动轮询）
  └── auth/       token 存取 + AuthContext（全局登录态）
```

- 登录态用 React Context（`AuthContext`），事件驱动 + 跨标签页同步，取代轮询。
- 所有请求经 `lib/http.ts`，自动附带 JWT、统一错误处理。
