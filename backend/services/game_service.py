"""游戏相关业务逻辑。

本次：generator 返回的 controls 既存进 game.controls（详情页展示），也传给
Cover Agent 用于精确驱动游戏来截图。
"""

from __future__ import annotations

import json
import shutil
import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import settings
from database.db import SessionLocal
from models.game import Game
from models.game_favorite import GameFavorite
from models.game_like import GameLike
from schemas.game import GameRead
from services.agents.cover import select_gameplay_cover
from services.agents.tagger import generate_tags
from services.game_generator import generate_game_html
from services.screenshot_service import capture_gameplay


# ---------- 查询 / 序列化 ----------
def get_game_or_404(db: Session, game_id: int) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    return game


def _parse_controls(raw: str | None) -> dict | None:
    if not raw:
        return None
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def serialize_game(
    game: Game, db: Session, user_id: int | None = None
) -> GameRead:
    like_count = (
        db.query(GameLike).filter(GameLike.game_id == game.id).count()
    )
    favorite_count = (
        db.query(GameFavorite).filter(GameFavorite.game_id == game.id).count()
    )

    liked = favorited = False
    if user_id is not None:
        liked = (
            db.query(GameLike)
            .filter(GameLike.game_id == game.id, GameLike.user_id == user_id)
            .first()
            is not None
        )
        favorited = (
            db.query(GameFavorite)
            .filter(
                GameFavorite.game_id == game.id,
                GameFavorite.user_id == user_id,
            )
            .first()
            is not None
        )

    return GameRead(
        id=game.id,
        title=game.title,
        description=game.description,
        status=game.status,
        author=game.author,
        tags=game.tags,
        cover_url=game.cover_url,
        play_count=game.play_count,
        like_count=like_count,
        favorite_count=favorite_count,
        liked=liked,
        favorited=favorited,
        created_at=game.created_at,
        play_url=(f"/games-files/{game.file_url}" if game.file_url else None),
        generation_logs=game.generation_logs,
        controls=_parse_controls(game.controls),
    )


# ---------- 点赞 / 收藏（toggle）----------
def toggle_like(db: Session, game_id: int, user_id: int) -> bool:
    get_game_or_404(db, game_id)
    existing = (
        db.query(GameLike)
        .filter(GameLike.game_id == game_id, GameLike.user_id == user_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(GameLike(game_id=game_id, user_id=user_id))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return True


def toggle_favorite(db: Session, game_id: int, user_id: int) -> bool:
    get_game_or_404(db, game_id)
    existing = (
        db.query(GameFavorite)
        .filter(
            GameFavorite.game_id == game_id, GameFavorite.user_id == user_id
        )
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(GameFavorite(game_id=game_id, user_id=user_id))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return True


def increment_play(db: Session, game_id: int) -> int:
    game = get_game_or_404(db, game_id)
    game.play_count += 1
    db.commit()
    db.refresh(game)
    return game.play_count


# ---------- 删除 ----------
def delete_game(db: Session, game: Game) -> None:
    if game.file_url:
        html_path = settings.generated_games_dir / game.file_url
        if html_path.exists():
            html_path.unlink()
    if game.cover_url:
        cover_name = game.cover_url.split("/")[-1]
        cover_path = settings.covers_dir / cover_name
        if cover_path.exists():
            cover_path.unlink()
    db.delete(game)
    db.commit()


# ---------- 生成（后台任务）----------
def run_generation(game_id: int) -> None:
    db = SessionLocal()
    try:
        game = db.get(Game, game_id)
        if game is None:
            return

        logs: list[str] = []
        try:
            tags = generate_tags(game.description or "")
            html, controls = generate_game_html(game.description or "", logs)

            game_uuid = str(uuid.uuid4())
            filename = f"{game_uuid}.html"
            html_path = settings.generated_games_dir / filename
            html_path.parent.mkdir(parents=True, exist_ok=True)
            html_path.write_text(html, encoding="utf-8")
            logs.append("💾 Storage Agent: HTML 已保存")

            # Cover Agent：拿 controls 精确驱动；没有就盲敲。限时内截进行中画面
            temp_dir = settings.temp_dir / game_uuid
            frames, initial = capture_gameplay(
                html_path.as_uri(),
                str(temp_dir),
                settings.cover_timeout_seconds,
                controls,
            )
            chosen = select_gameplay_cover(frames, initial)

            cover_name = f"{game_uuid}.png"
            cover_path = settings.covers_dir / cover_name
            cover_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(chosen, cover_path)

            driven = "（用控制说明精确驱动）" if controls else "（盲敲常用键）"
            logs.append(
                f"🖼️ Cover Agent: 抓到游戏进行中画面{driven}"
                if chosen != initial
                else f"🖼️ Cover Agent: 未玩起来/超时，使用初始帧{driven}"
            )

            game.file_url = filename
            game.tags = tags
            game.cover_url = f"/covers/{cover_name}"
            game.controls = json.dumps(controls) if controls else None
            game.status = "COMPLETED"
            game.generation_logs = "\n".join(logs)
            db.commit()
        except Exception as exc:  # noqa: BLE001
            logs.append(f"❌ 生成失败: {exc}")
            game.status = "FAILED"
            game.generation_logs = "\n".join(logs)
            db.commit()
    finally:
        db.close()
