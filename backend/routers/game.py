import os
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import SessionLocal
from models.game import Game

from services.game_generator import generate_game_html
from services.auth_service import (
    get_current_user
)

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
def create_game(
    request: CreateGameRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    print("Generating Game...")

    game = Game(
        title=request.title,
        description=request.description,
        file_url="",
        creator_id=int(current_user["sub"]),
        author=current_user["email"],
        tags="AI,HTML5,Game",
        cover_url="https://placehold.co/400x250",
        status="GENERATING"
    )

    db.add(game)

    db.commit()

    db.refresh(game)

    try:

        html_content = generate_game_html(
            request.description
        )

        print("Game Generated")

        # generate a unique file name
        game_uuid = str(uuid.uuid4())

        filename = f"{game_uuid}.html"

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

        game.file_url = filename

        game.status = "COMPLETED"

        db.commit()

        db.refresh(game)

        return {
            "id": game.id,
            "title": game.title,
            "status": game.status,
            "creator_id": game.creator_id,
            "play_url":
                f"/games-files/{game.file_url}"
        }

    except Exception as e:

        print("Game Generation Failed")

        print(str(e))

        game.status = "FAILED"

        db.commit()

        raise e


@router.get("/")
def get_games(
    db: Session = Depends(get_db)
):
    games = db.query(Game).all()

    return games

@router.get("/my-games")
def get_my_games(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    games = (
        db.query(Game)
        .filter(
            Game.creator_id == int(
                current_user["sub"]
            )
        )
        .all()
    )

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
        "status": game.status,
        "creator_id": game.creator_id,
        "play_url":
            f"/games-files/{game.file_url}"
    }
