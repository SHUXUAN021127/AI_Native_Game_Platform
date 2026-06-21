"""应用入口。

修复点：
- CORS 用配置里的具体来源，不再 allow_origins=["*"] 配 credentials=True
  （那个组合浏览器会直接拒绝）；
- 静态目录全部用 settings 里的绝对路径挂载，不再 storage 与 ../storage
  混用；
- 去掉重复的 User/Game.metadata.create_all。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401  确保所有模型被注册到 Base.metadata
from config import settings
from database.db import Base, engine
from routers.auth import router as auth_router
from routers.game import router as game_router
from routers.upload import router as upload_router

# 确保存储目录存在
for directory in (
    settings.generated_games_dir,
    settings.covers_dir,
    settings.uploads_dir,
    settings.temp_dir,
):
    directory.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="AI Native Game Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(game_router)
app.include_router(upload_router)

app.mount(
    "/games-files",
    StaticFiles(directory=str(settings.generated_games_dir)),
    name="games-files",
)
app.mount(
    "/covers",
    StaticFiles(directory=str(settings.covers_dir)),
    name="covers",
)
app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.uploads_dir)),
    name="uploads",
)

# 开发期便利；生产建议改用 `alembic upgrade head`
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "running"}
