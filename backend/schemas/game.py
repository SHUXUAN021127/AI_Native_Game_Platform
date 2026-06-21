from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class GameStatus(str, Enum):
    pending = "PENDING"
    generating = "GENERATING"
    completed = "COMPLETED"
    failed = "FAILED"


class GameCreate(BaseModel):
    title: str
    description: str


class GameRead(BaseModel):
    """返回给前端的游戏结构。

    字段刻意跟旧的 game_to_dict 输出一致，所以前端这一批不用改。
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    status: GameStatus
    author: str | None = None
    tags: str | None = None
    cover_url: str | None = None
    play_count: int = 0
    like_count: int = 0
    favorite_count: int = 0
    liked: bool = False
    favorited: bool = False
    created_at: datetime | None = None
    play_url: str | None = None
    generation_logs: str | None = None
