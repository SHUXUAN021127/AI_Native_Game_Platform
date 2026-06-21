"""集中导入所有模型，确保建表/Alembic 能发现全部表，
且 relationship 的字符串引用能在同一 registry 内解析。"""

from models.game import Game
from models.game_favorite import GameFavorite
from models.game_like import GameLike
from models.user import User

__all__ = ["User", "Game", "GameLike", "GameFavorite"]
