# 🎮 AI Native Game Platform

用一句话描述你想要的游戏，AI 多 Agent 流水线自动生成一个可玩的 HTML5 小游戏，
**真实运行游戏**截取进行中的画面作为封面，并发布到平台供他人游玩。

> 一个 AI 原生（AI-Native）的游戏创作与分享平台：前端 Next.js + 后端 FastAPI，
> 核心是一条「规划 → 生成 → 校验 → 真实运行截图」的多 Agent 流水线。

---

## ✨ 亮点

- **多 Agent 生成流水线**：Planner → Generator → Reviewer，再加 Tagger、Cover Agent，
  各司其职、带校验关卡和失败重试，不是单次 LLM 调用。
- **智能 Cover Agent（项目最有含金量的部分）**：封面不是简单截个初始界面——它用
  无头浏览器**真的把游戏玩起来**（按生成时附带的控制说明精确驱动），截**进行中**的
  画面当封面。这一步顺带验证了「游戏到底跑不跑得起来」。10 秒预算内拿不到就回退初始帧，
  保证体验有下限。
- **异步生成**：提交后立即返回（202），生成在后台跑，前端轮询状态，不阻塞。
- **完整的角色与权限**：player / creator / admin 三级，含独立的管理后台。
- **可配置模型**：基于 OpenAI 兼容接口，换模型只改 `.env`（OpenAI / DeepSeek / 通义 / 智谱 等）。

---

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16（App Router）、React 19、TypeScript |
| 后端 | FastAPI、SQLAlchemy 2.0、Pydantic v2、Uvicorn |
| 数据库 | SQLite（开发）/ 可切 PostgreSQL；Alembic 迁移 |
| AI | OpenAI 兼容 Chat Completions 接口 |
| 截图 | Playwright（无头 Chromium）、Pillow |
| 认证 | JWT（python-jose）、bcrypt（passlib） |
| 部署 | Docker / docker-compose |

---

## 🗺️ 架构总览

```
用户描述
   │
   ▼
[Planner] 规划需求 ──► [Generator] 生成 HTML + 控制说明 ──► [Reviewer] 校验
                                                                  │
                              ┌───────────────────────────────────┘
                              ▼
                       [Tagger] 生成标签
                              │
                              ▼
                  [Cover Agent] 用控制说明驱动游戏 → 截进行中画面 → 选帧
                              │
                              ▼
                     落盘 HTML / 封面，状态置 COMPLETED
```

- 提交生成是**异步**的：接口立即返回 `202`，上面整条流水线在后台任务里跑，
  期间游戏状态为 `GENERATING`，完成后变 `COMPLETED`（失败 `FAILED`，可 retry）。
- 详见 [`docs/architecture.md`](docs/architecture.md)。

---

## 📁 目录结构

```
ai_native_platform/
├── backend/
│   ├── config.py                 # 集中配置（pydantic-settings）
│   ├── main.py                   # FastAPI 入口、CORS、静态挂载、路由注册
│   ├── database/db.py            # engine / Session / Base / get_db
│   ├── models/                   # User, Game, GameLike, GameFavorite
│   ├── schemas/                  # Pydantic 请求/响应模型
│   ├── routers/                  # auth, game, upload, admin
│   ├── services/                 # 业务逻辑
│   │   ├── auth_service.py       # 密码/JWT/依赖
│   │   ├── game_service.py       # 游戏业务 + 后台生成编排
│   │   ├── admin_service.py      # 用户管理（保护 admin）
│   │   ├── game_generator.py     # 流水线编排
│   │   ├── screenshot_service.py # Cover Agent 的截图驱动
│   │   └── agents/               # planner / generator / reviewer / tagger / cover
│   ├── alembic/                  # 数据库迁移
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                      # 页面：home, create, game/[id], history,
│   │                             #       login, register, my-games, admin
│   ├── components/               # GameCard, StatusBadge, GameLogs, TagList, Navbar
│   ├── lib/                      # config, types, http, api, theme, hooks, auth/
│   └── Dockerfile
├── docs/                         # 架构 / API / 数据库 / 部署文档
├── docker-compose.yml
└── README.md
```

---

## 🚀 快速开始

### 准备
- Python 3.12+、Node.js 20+
- 一个 OpenAI 兼容接口的 API key（OpenAI / DeepSeek / 通义千问 / 智谱 等均可）

### 方式一：本地直接跑（开发推荐）

**后端**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium                        # 安装无头浏览器
cp .env.example .env                               # 填入下方配置
uvicorn main:app --reload
```

**前端**（另开一个终端）
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

访问 http://localhost:3000， 后端文档在 http://localhost:8000/docs 。

### 方式二：Docker

```bash
# 在 backend/.env 配好（DATABASE_URL 用容器路径，见下）
docker compose up --build
```
详见 [`docs/deployment.md`](docs/deployment.md)。

---

## ⚙️ 配置（backend/.env）

```ini
SECRET_KEY=一串无空格的强随机值          # python -c "import secrets; print(secrets.token_urlsafe(48))"
OPENAI_API_KEY=你的key
MODEL_BASE_URL=https://api.openai.com/v1  # 或国内兼容端点
MODEL_NAME=gpt-4o-mini                     # 按你的模型填
DATABASE_URL=sqlite:///./game_platform.db  # Docker 用 sqlite:////app/storage/game_platform.db
CORS_ORIGINS=http://localhost:3000
COVER_TIMEOUT_SECONDS=10
```

> `SECRET_KEY` / `OPENAI_API_KEY` 缺失会在启动时直接报错（而非运行到一半）。

---

## 👥 角色与权限

| 角色 | 能做什么 |
|---|---|
| player | 浏览、游玩、点赞、收藏 |
| creator | 以上 + 创建/生成游戏、管理自己的游戏 |
| admin | 以上 + 管理后台：管理所有用户（**不能动其他 admin**）和所有游戏 |

注册接口不允许自助注册 admin。第一个 admin 需在数据库里设置：
```bash
sqlite3 backend/game_platform.db "UPDATE users SET role='admin' WHERE email='你的邮箱';"
```
之后可在 `/admin` 后台给其他人开通。

---

## 🔌 API 概览

| 分组 | 示例 |
|---|---|
| Auth | `POST /auth/register`、`POST /auth/login` |
| Games | `GET /games/`、`POST /games/`、`GET /games/{id}`、`POST /games/{id}/like` … |
| Upload | `POST /upload/` |
| Admin | `GET /admin/users`、`PATCH /admin/users/{id}/role`、`GET /admin/games` |

完整列表见 [`docs/api.md`](docs/api.md) 或运行后访问 `/docs`（Swagger UI）。

---

## 📚 更多文档
- [架构设计](docs/architecture.md)
- [API 参考](docs/api.md)
- [数据模型](docs/database.md)
- [部署指南](docs/deployment.md)

---

## 📝 说明
本项目仅用于学习与演示。生成游戏需要可用的模型额度；Cover Agent 依赖 Playwright/Chromium，
部署时需运行在能安装浏览器的容器/服务器上。
