from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class GameStatus(str, Enum):
    pending = "PENDING"
    generating = "GENERATING"
    completed = "COMPLETED"
    failed = "FAILED"


class GameControls(BaseModel):
    """游戏控制说明：generator 产出，Cover Agent 用来精确驱动，详情页展示给玩家。"""

    start: str | None = None        # 如何开始，例 "Enter" / "Space" / "click"
    keys: list[str] = []            # 操作键，例 ["ArrowLeft", "ArrowRight", "Space"]
    notes: str | None = None        # 给玩家看的说明文字


class GameCreate(BaseModel):
    title: str
    description: str


class GameRead(BaseModel):
    """返回给前端的游戏结构。字段与旧 game_to_dict 一致，另加 controls。"""

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
    controls: GameControls | None = None
