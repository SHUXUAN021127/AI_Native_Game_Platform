from fastapi import FastAPI
from routers.auth import router as auth_router
from database.db import Base,engine
from models.user import User
from models.game import Game
from routers.game import router as game_router
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers.upload import router as upload_router


app = FastAPI(
    title="AI Native Game Platform"
)
app.include_router(auth_router)
app.include_router(game_router)

app.mount(
    "/games-files",
    StaticFiles(directory="../storage/generated_games"),
    name="games-files"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    upload_router
)

app.mount(
    "/uploads",
    StaticFiles(
        directory="../storage/uploads"
    ),
    name="uploads"
)


Base.metadata.create_all(bind=engine)
User.metadata.create_all(bind=engine)
Game.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "running"
    }