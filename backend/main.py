"""应用入口。

修复点（第 2 批）：CORS 用具体来源；静态目录用绝对路径；去掉重复 create_all。
本次新增：注册 admin 路由。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401  确保所有模型被注册到 Base.metadata
from config import settings
from database.db import Base, engine
from routers.admin import router as admin_router
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
app.include_router(admin_router)

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
