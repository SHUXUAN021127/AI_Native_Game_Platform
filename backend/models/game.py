from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base

if TYPE_CHECKING:
    from models.game_favorite import GameFavorite
    from models.game_like import GameLike
    from models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str] = mapped_column(String, default="", nullable=False)
    creator_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    author: Mapped[str | None] = mapped_column(String, nullable=True)
    tags: Mapped[str | None] = mapped_column(String, nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(
        String, default="PENDING", nullable=False, index=True
    )
    play_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    generation_logs: Mapped[str | None] = mapped_column(Text, nullable=True)
    # 控制说明（generator 产出的 JSON 字符串）：Cover Agent 精确驱动 + 详情页展示
    controls: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False, index=True
    )

    creator: Mapped[User] = relationship(back_populates="games")
    likes: Mapped[list[GameLike]] = relationship(
        back_populates="game", cascade="all, delete-orphan"
    )
    favorites: Mapped[list[GameFavorite]] = relationship(
        back_populates="game", cascade="all, delete-orphan"
    )
