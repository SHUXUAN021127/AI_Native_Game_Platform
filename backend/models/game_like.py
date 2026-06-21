from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base

if TYPE_CHECKING:
    from models.game import Game
    from models.user import User


class GameLike(Base):
    __tablename__ = "game_likes"
    # 关键改进：从数据库层保证一个用户对一个游戏只能点一次赞
    __table_args__ = (
        UniqueConstraint("user_id", "game_id", name="uq_like_user_game"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    game_id: Mapped[int] = mapped_column(
        ForeignKey("games.id", ondelete="CASCADE"), index=True, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="likes")
    game: Mapped[Game] = relationship(back_populates="likes")
