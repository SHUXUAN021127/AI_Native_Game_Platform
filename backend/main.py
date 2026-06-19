from fastapi import FastAPI
from routers.auth import router as auth_router
from database.db import Base,engine
from models.user import User
from models.game import Game
from routers.game import router as game_router

app = FastAPI(
    title="AI Native Game Platform"
)
app.include_router(auth_router)
app.include_router(game_router)


Base.metadata.create_all(bind=engine)
User.metadata.create_all(bind=engine)
Game.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "running"
    }