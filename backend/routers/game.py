import os
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.game import Game
from services.agents.tagger import (
    generate_tags
)
from services.game_generator import generate_game_html
from services.auth_service import (
    get_current_user
)
from services.screenshot_service import (
    capture_screenshots
)

from services.cover_selector import (
    select_best_cover
)
from models.game_like import GameLike
from models.game_favorite import GameFavorite
from services.auth_service import (
    decode_token
)

from fastapi.security import (
    OAuth2PasswordBearer
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)

router = APIRouter(
    prefix="/games",
    tags=["Games"]
)

class CreateGameRequest(BaseModel):
    title: str
    description: str

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

def game_to_dict(
    game,
    db,
    user_id=None
):
    liked = False

    favorited = False

    if user_id:
        liked = (
                db.query(GameLike)
                .filter(
                    GameLike.game_id == game.id,
                    GameLike.user_id == user_id
                )
                .first()
                is not None
        )

        favorited = (
                db.query(GameFavorite)
                .filter(
                    GameFavorite.game_id == game.id,
                    GameFavorite.user_id == user_id
                )
                .first()
                is not None
        )

    like_count = (
        db.query(GameLike)
        .filter(
            GameLike.game_id == game.id
        )
        .count()
    )

    favorite_count = (
        db.query(GameFavorite)
        .filter(
            GameFavorite.game_id == game.id
        )
        .count()
    )

    return {

        "id": game.id,

        "title": game.title,

        "description":
            game.description,

        "status":
            game.status,

        "author":
            game.author,

        "tags":
            game.tags,

        "cover_url":
            game.cover_url,

        "play_count":
            game.play_count,

        "like_count":
            like_count,

        "favorite_count":
            favorite_count,

        "play_url":
            f"/games-files/{game.file_url}",

        "liked": liked,

        "favorited": favorited,
    }


@router.post("/")
def create_game(
    request: CreateGameRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    if (
            current_user["role"]
            not in ["creator", "admin"]
    ):
        raise HTTPException(
            status_code=403,
            detail="Creator only"
        )

    print("Generating Game...")

    game = Game(
        title=request.title,
        description=request.description,
        file_url="",
        creator_id=int(current_user["sub"]),
        author=current_user["email"],
        tags="",
        cover_url="https://placehold.co/400x250",
        status="GENERATING"
    )

    db.add(game)

    db.commit()

    db.refresh(game)

    try:

        logs = [
            "🧠 Planner Agent: Analyze Prompt",
            "🎮 Coding Agent: Generate Game",
            "🔍 Review Agent: Validate Output",
            "💾 Storage Agent: Save HTML"
        ]

        generated_tags = (
            generate_tags(
                request.description
            )
        )

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

        game_url = (
            f"http://127.0.0.1:8000/games-files/{filename}"
        )

        screenshots = (
            capture_screenshots(
                game_url,
                f"storage/temp/{game_uuid}"
            )
        )

        best_cover = (
            select_best_cover(
                screenshots
            )
        )

        cover_name = (
            f"{game_uuid}.png"
        )

        cover_path = (
            os.path.join(
                "storage",
                "covers",
                cover_name
            )
        )

        os.replace(
            best_cover,
            cover_path
        )

        game.cover_url = (
            f"/covers/{cover_name}"
        )

        game.file_url = filename

        game.tags = generated_tags

        game.status = "COMPLETED"

        game.generation_logs = (
            "\n".join(logs)
        )

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
    db: Session = Depends(get_db),
    token: str = Depends(
        oauth2_scheme
    )
):

    user_id = None

    if token:

        try:

            payload = decode_token(
                token
            )

            user_id = int(
                payload["sub"]
            )

        except:

            pass

    games = db.query(Game).all()

    return [
        game_to_dict(
            game,
            db,
            user_id
        )
        for game in games
    ]

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

    return [
        game_to_dict(
            game,
            db,
            int(
                current_user["sub"]
            )
        )
        for game in games
    ]

@router.get("/history")
def get_generation_history(
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    games = (
        db.query(Game)
        .filter(
            Game.creator_id ==
            int(current_user["sub"])
        )
        .order_by(
            Game.created_at.desc()
        )
        .all()
    )

    return [
        game_to_dict(
            game,
            db,
            int(
                current_user["sub"]
            )
        )
        for game in games
    ]

@router.get("/recent")
def get_recent_games(
    db: Session = Depends(get_db),
    token: str = Depends(
        oauth2_scheme
    )
):
    user_id = None

    if token:

        try:

            payload = decode_token(
                token
            )

            user_id = int(
                payload["sub"]
            )

        except:

            pass

    games = (
        db.query(Game)
        .order_by(
            Game.created_at.desc()
        )
        .limit(3)
        .all()
    )

    return [
        game_to_dict(
            game,
            db,
            user_id
        )
        for game in games
    ]

@router.post("/{game_id}/play")
def play_game(
    game_id: int,
    db: Session = Depends(get_db)
):

    game = (
        db.query(Game)
        .filter(
            Game.id == game_id
        )
        .first()
    )

    if not game:

        raise HTTPException(
            status_code=404,
            detail="Game not found"
        )

    game.play_count += 1

    db.commit()

    db.refresh(game)

    return {
        "play_count":
        game.play_count
    }

@router.post("/{game_id}/like")
def like_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    existing = (
        db.query(GameLike)
        .filter(
            GameLike.game_id == game_id,
            GameLike.user_id ==
            int(current_user["sub"])
        )
        .first()
    )

    if existing:

        db.delete(existing)

        db.commit()

        return {
            "liked": False
        }

    new_like = GameLike(
        game_id=game_id,
        user_id=int(
            current_user["sub"]
        )
    )

    db.add(new_like)

    db.commit()

    return {
        "liked": True
    }

@router.post("/{game_id}/favorite")
def favorite_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    existing = (
        db.query(GameFavorite)
        .filter(
            GameFavorite.game_id == game_id,
            GameFavorite.user_id ==
            int(current_user["sub"])
        )
        .first()
    )

    if existing:

        db.delete(existing)

        db.commit()

        return {
            "favorited": False
        }

    new_favorite = GameFavorite(
        game_id=game_id,
        user_id=int(
            current_user["sub"]
        )
    )

    db.add(new_favorite)

    db.commit()

    return {
        "favorited": True
    }

@router.get("/{game_id}")
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(
        oauth2_scheme
    )
):

    user_id = None

    if token:

        try:

            payload = decode_token(
                token
            )

            user_id = int(
                payload["sub"]
            )

        except:

            pass

    game = (
        db.query(Game)
        .filter(Game.id == game_id)
        .first()
    )

    if not game:

        return {
            "message": "Game not found"
        }

    return game_to_dict(
        game,
        db,
        user_id
    )

@router.post("/{game_id}/retry")
def retry_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    game = (
        db.query(Game)
        .filter(
            Game.id == game_id
        )
        .first()
    )

    if not game:
        return {
            "message":
            "Game not found"
        }

    html_content = generate_game_html(
        game.description
    )

    filename = game.file_url

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

    game.status = "COMPLETED"

    db.commit()

    return {
        "message":
        "Retry success"
    }

@router.delete("/{game_id}")
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    game = (
        db.query(Game)
        .filter(
            Game.id == game_id
        )
        .first()
    )

    if not game:

        return {
            "message":
            "Game not found"
        }

    if (
            current_user["role"]
            != "admin"
            and
            game.creator_id
            != int(
        current_user["sub"]
    )
    ):

        raise HTTPException(
            status_code=403,
            detail="Forbidden"
        )

    db.delete(game)

    db.commit()

    return {
        "message":
        "Game deleted"
    }

