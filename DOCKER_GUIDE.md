# 用 Docker 跑起来 · 一步步

## 0. 准备
- 装 **Docker Desktop**（Windows/Mac）或 Docker Engine（Linux），装好后
  `docker --version` 能输出版本号即可。

## 1. 把这些文件放进项目对应位置
```
ai_native_platform/
├── docker-compose.yml                      ← 本包，放根目录
├── backend/
│   ├── Dockerfile                          ← 本包
│   ├── .dockerignore                       ← 本包
│   ├── .env                                ← 由 .env.docker.example 复制改成
│   └── services/screenshot_service.py      ← 本包（已加 --no-sandbox）
└── frontend/
    └── Dockerfile                          ← 本包
```
> `screenshot_service.py` 必须用本包这版：容器里以 root 跑 Chromium，
> 不加 `--no-sandbox` 会启动失败。

## 2. 配置后端 .env
```bash
cd backend
cp .env.docker.example .env
# 编辑 .env：填 SECRET_KEY（强随机）、OPENAI_API_KEY、MODEL_BASE_URL/MODEL_NAME
```
注意 `.env` 里数据库已指向 `sqlite:////app/storage/game_platform.db`——这个路径
在持久卷上，不要改成别的，否则重建容器会丢数据。

## 3. 确认依赖齐全
`backend/requirements.txt` 里要有：`pydantic-settings`、`alembic`、`playwright`、
`Pillow`、`openai`、`fastapi`、`uvicorn` 等（前几批新增的别漏）。

## 4. 一条命令启动
在项目根目录：
```bash
docker compose up --build
```
第一次会比较久（要装依赖 + 下载 Chromium，镜像几百 MB 正常）。看到后端在
8000、前端在 3000 监听就成了。

## 5. 验证
- 后端接口文档：http://localhost:8000/docs
- 前端：http://localhost:3000
- 注册 → 登录 → Create 生成一个游戏，能跑通就说明整条链路（含容器里的
  Playwright 截图）都正常。

## 6. 常用命令
```bash
docker compose up --build        # 前台启动（看日志）
docker compose up -d --build     # 后台启动
docker compose logs -f backend   # 看后端日志
docker compose down              # 停止并删容器（卷里的数据保留）
docker compose down -v           # 连卷一起删（会清空数据库和游戏文件！慎用）
docker compose build backend     # 只重建后端镜像
```
改了代码要重新 `up --build` 才生效。

## 7. 数据在哪
都在名为 `backend_storage` 的卷里（数据库 + 生成的游戏/封面/上传）。
容器删了重建数据还在；只有 `down -v` 才会清掉。

## 8. 建第一个 admin
容器跑起来后，进后端容器改库：
```bash
docker compose exec backend python -c "import sqlite3; c=sqlite3.connect('/app/storage/game_platform.db'); c.execute(\"UPDATE users SET role='admin' WHERE email='你的邮箱'\"); c.commit(); print('rows', c.total_changes)"
```
那个邮箱要先注册过。改完重新登录前端。

## 常见坑
- 改了前端要访问的后端地址，要改 `docker-compose.yml` 里的
  `NEXT_PUBLIC_API_BASE_URL` 并 `up --build`（它是构建期注入的）。
- 上线到公网时把它改成后端的公网 https 地址，并把后端 `CORS_ORIGINS` 改成
  前端公网域名。
- 国内不开 VPN：`MODEL_BASE_URL` 用国内模型；构建时 Chromium 下载慢可在
  backend/Dockerfile 的 install 那行前面加
  `ENV PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright`。
