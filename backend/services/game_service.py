"""游戏相关业务逻辑。

把原本挤在 routers/game.py 里的逻辑抽到这一层：路由只负责收参数、调
service、返回；具体怎么生成、怎么序列化、怎么点赞，都在这里。

重点改进：
- run_generation 在后台任务里跑（LLM + 截图很慢），用自己独立的
  数据库 session，不占用请求；
- 截图改用本地 file:// 加载生成的 HTML，不再依赖写死的 127.0.0.1
  服务地址；
- 序列化产出 schemas.game.GameRead，字段与旧 game_to_dict 一致。
"""

from __future__ import annotations

import os
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
from services.agents.tagger import generate_tags
from services.cover_selector import select_best_cover
from services.game_generator import generate_game_html
from services.screenshot_service import capture_screenshots


# ---------- 查询 / 序列化 ----------
def get_game_or_404(db: Session, game_id: int) -> Game:
    game = db.get(Game, game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found"
        )
    return game


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
        # 并发下唯一约束兜底：已经点过了
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
    # 删生成的 HTML
    if game.file_url:
        html_path = settings.generated_games_dir / game.file_url
        if html_path.exists():
            html_path.unlink()
    # 删封面
    if game.cover_url:
        cover_name = game.cover_url.split("/")[-1]
        cover_path = settings.covers_dir / cover_name
        if cover_path.exists():
            cover_path.unlink()
    # 点赞/收藏由模型 cascade 一并删除
    db.delete(game)
    db.commit()


# ---------- 生成（后台任务）----------
def run_generation(game_id: int) -> None:
    """在后台任务里运行：自带独立 session，全程更新 game 状态与日志。"""
    db = SessionLocal()
    try:
        game = db.get(Game, game_id)
        if game is None:
            return

        logs: list[str] = []
        try:
            tags = generate_tags(game.description or "")
            html = generate_game_html(game.description or "", logs)

            game_uuid = str(uuid.uuid4())
            filename = f"{game_uuid}.html"
            html_path = settings.generated_games_dir / filename
            html_path.parent.mkdir(parents=True, exist_ok=True)
            html_path.write_text(html, encoding="utf-8")
            logs.append("💾 Storage Agent: HTML 已保存")

            # 用本地文件直接渲染截图，不依赖运行中的 HTTP 服务
            temp_dir = settings.temp_dir / game_uuid
            screenshots = capture_screenshots(html_path.as_uri(), str(temp_dir))
            best_cover = select_best_cover(screenshots)

            cover_name = f"{game_uuid}.png"
            cover_path = settings.covers_dir / cover_name
            cover_path.parent.mkdir(parents=True, exist_ok=True)
            os.replace(best_cover, cover_path)
            logs.append("🖼️ Cover Agent: 封面已选定")

            game.file_url = filename
            game.tags = tags
            game.cover_url = f"/covers/{cover_name}"
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
