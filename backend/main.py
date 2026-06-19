from fastapi import FastAPI
from routers.auth import router as auth_router
from database.db import engine
from models.user import User

app = FastAPI(
    title="AI Native Game Platform"
)
app.include_router(auth_router)

User.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {
        "message": "running"
    }