import os
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import SessionLocal
from models.game import Game

from services.game_generator import generate_game_html

router = APIRouter(
    prefix="/games",
    tags=["Games"]
)

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

class CreateGameRequest(BaseModel):
    title: str
    description: str

@router.post("/")
def create_game(request: CreateGameRequest,
                db: Session = Depends(get_db)):
    html_content = generate_game_html(
        request.description
    )
    #generate a unique file name
    game_uuid = str(uuid.uuid4())

    filename = f"{game_uuid}.html"

    #store file
    BASE_DIR = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    storage_dir = os.path.join(
        BASE_DIR,
        "..",
        "storage",
        "generated_games"
    )

    os.makedirs(
        storage_dir,
        exist_ok=True
    )

    file_path = os.path.join(
        storage_dir,
        filename
    )

    with open(
            file_path,
            "w",
            encoding="utf-8"
    ) as f:
        f.write(html_content)

    game = Game(
        title=request.title,
        description=request.description,
        file_url=filename,
        creator_id=1
    )

    db.add(game)

    db.commit()

    db.refresh(game)

    return {
        "id": game.id,
        "title": game.title,
        "play_url":
            f"/games-files/{game.file_url}"
    }


@router.get("/")
def get_games(
    db: Session = Depends(get_db)
):
    games = db.query(Game).all()

    return games

@router.get("/{game_id}")
def get_game(
    game_id: int,
    db: Session = Depends(get_db)
):
    game = (
        db.query(Game)
        .filter(Game.id == game_id)
        .first()
    )

    if not game:
        return {
            "message": "Game not found"
        }

    return {
        "id": game.id,
        "title": game.title,
        "description": game.description,
        "play_url":
            f"/games-files/{game.file_url}"
    }