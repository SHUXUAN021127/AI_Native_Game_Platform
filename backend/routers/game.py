"""游戏路由。

路由只做：取参数 → 调 service → 返回。业务逻辑都在 services/game_service.py。
注意路由声明顺序：字面路径（/my-games、/history、/recent）必须在动态
路径 /{game_id} 之前，否则会被后者吞掉。
"""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.game import Game
from schemas.auth import TokenPayload
from schemas.game import GameCreate, GameRead
from services import game_service
from services.auth_service import (
    get_current_user,
    get_optional_user,
    require_roles,
)

router = APIRouter(prefix="/games", tags=["Games"])


@router.post(
    "/", response_model=GameRead, status_code=status.HTTP_202_ACCEPTED
)
def create_game(
    request: GameCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_roles("creator", "admin")),
):
    game = Game(
        title=request.title,
        description=request.description,
        file_url="",
        creator_id=int(user.sub),
        author=user.email,
        tags="",
        cover_url="https://placehold.co/400x250",
        status="GENERATING",
        generation_logs="🧠 已加入生成队列",
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    # 立刻返回，生成在后台跑（前端轮询状态即可）
    background_tasks.add_task(game_service.run_generation, game.id)
    return game_service.serialize_game(game, db, int(user.sub))


@router.get("/", response_model=list[GameRead])
def list_games(
    db: Session = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
):
    uid = int(user.sub) if user else None
    games = db.query(Game).all()
    return [game_service.serialize_game(g, db, uid) for g in games]


@router.get("/my-games", response_model=list[GameRead])
def list_my_games(
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    uid = int(user.sub)
    games = db.query(Game).filter(Game.creator_id == uid).all()
    return [game_service.serialize_game(g, db, uid) for g in games]


@router.get("/history", response_model=list[GameRead])
def generation_history(
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    uid = int(user.sub)
    query = db.query(Game)
    if user.role != "admin":
        query = query.filter(Game.creator_id == uid)
    games = query.order_by(Game.created_at.desc()).all()
    return [game_service.serialize_game(g, db, uid) for g in games]


@router.get("/recent", response_model=list[GameRead])
def recent_games(
    db: Session = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
):
    uid = int(user.sub) if user else None
    games = db.query(Game).order_by(Game.created_at.desc()).limit(3).all()
    return [game_service.serialize_game(g, db, uid) for g in games]


@router.post("/{game_id}/play")
def play_game(game_id: int, db: Session = Depends(get_db)):
    play_count = game_service.increment_play(db, game_id)
    return {"play_count": play_count}


@router.post("/{game_id}/like")
def like_game(
    game_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    liked = game_service.toggle_like(db, game_id, int(user.sub))
    return {"liked": liked}


@router.post("/{game_id}/favorite")
def favorite_game(
    game_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    favorited = game_service.toggle_favorite(db, game_id, int(user.sub))
    return {"favorited": favorited}


@router.post("/{game_id}/retry", response_model=GameRead)
def retry_game(
    game_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    game = game_service.get_game_or_404(db, game_id)
    if user.role != "admin" and game.creator_id != int(user.sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
        )
    game.status = "GENERATING"
    db.commit()
    db.refresh(game)
    background_tasks.add_task(game_service.run_generation, game.id)
    return game_service.serialize_game(game, db, int(user.sub))


@router.get("/{game_id}", response_model=GameRead)
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload | None = Depends(get_optional_user),
):
    game = game_service.get_game_or_404(db, game_id)
    uid = int(user.sub) if user else None
    return game_service.serialize_game(game, db, uid)


@router.delete("/{game_id}")
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    game = game_service.get_game_or_404(db, game_id)
    if user.role != "admin" and game.creator_id != int(user.sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
        )
    game_service.delete_game(db, game)
    return {"message": "Game deleted"}
