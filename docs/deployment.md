# 部署指南

三种方式：本地直接跑（开发）、Docker（本地/单机）、云服务器（上线）。

---

## 关键约束（先读）

- **Playwright/Chromium**：Cover Agent 需无头浏览器，**后端不能跑在 serverless**
  （Vercel Functions / Lambda），必须容器或服务器。
- **数据持久化**：SQLite 文件和 `storage/`（游戏 HTML、封面、上传）在本地磁盘，
  容器文件系统多为临时，**重新部署会清空**——需持久卷或换 Postgres + 对象存储。
- **前端地址是构建期注入**：`NEXT_PUBLIC_API_BASE_URL` 改了要重新构建/部署。

---

## 一、本地直接跑（开发）

后端：
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env        # 填配置，DATABASE_URL 用 sqlite:///./game_platform.db
uvicorn main:app --reload
```
前端：
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

---

## 二、Docker（本地/单机）

需要：`docker-compose.yml`（根目录）、`backend/Dockerfile`、`frontend/Dockerfile`。

`backend/.env`（注意数据库用**容器路径**）：
```ini
DATABASE_URL=sqlite:////app/storage/game_platform.db
CORS_ORIGINS=http://localhost:3000
# 其余同上
```
启动：
```bash
docker compose up --build
```
- 前端 http://localhost:3000 ，后端 http://localhost:8000/docs
- 数据在 `backend_storage` 卷里，容器重建不丢；`docker compose down -v` 才会清。
- 容器内 Chromium 必须以 `--no-sandbox --disable-dev-shm-usage` 启动（`screenshot_service.py`
  里已处理）。
- 后端镜像强制 UTF-8 环境，避免中文/emoji 触发 ascii 编码错。

常用命令：
```bash
docker compose up -d --build     # 后台
docker compose logs -f backend   # 日志
docker compose down              # 停止（数据留）
```

---

## 三、云服务器上线

1. 租一台 Ubuntu 服务器，**至少 2核4G**（Playwright 吃内存）。
2. 装 Docker，拉代码。
3. 改两处地址：
   - `docker-compose.yml` 的 `NEXT_PUBLIC_API_BASE_URL` → 后端公网 https 地址；
   - `backend/.env` 的 `CORS_ORIGINS` → 前端公网域名。
4. 配 HTTPS + 域名：前面加 Nginx/Caddy 反向代理，80/443 转发到容器，
   用 Let's Encrypt 签免费证书（Caddy 可自动签）。
5. `docker compose up -d --build`，开机自启、后台常驻。
6. 持久卷定期备份（尤其数据库）。

提醒：
- 国内服务器绑域名需**备案**（耗时，建议先办）。
- 安全组放行 80/443。
- **模型端点**：上线不能依赖 VPN。用国内可直连的 OpenAI 兼容端点或国产模型，
  只改 `backend/.env` 的 `MODEL_BASE_URL` / `MODEL_NAME`。

---

## 创建第一个 admin
```bash
# 本地
sqlite3 backend/game_platform.db "UPDATE users SET role='admin' WHERE email='你的邮箱';"
# Docker
docker compose exec backend python -c "import sqlite3; c=sqlite3.connect('/app/storage/game_platform.db'); c.execute(\"UPDATE users SET role='admin' WHERE email='你的邮箱'\"); c.commit(); print(c.total_changes)"
```
邮箱需先注册过，改完重新登录。
