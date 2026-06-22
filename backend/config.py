"""集中式应用配置（根目录 config.py，import 路径不变：`from config import ...`）。"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- 安全 ---
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # --- 数据库 ---
    database_url: str = "sqlite:///./game_platform.db"

    # --- 模型 / OpenAI ---
    openai_api_key: str
    model_base_url: str | None = None
    model_name: str = "gpt-5.5"

    # --- 封面 ---
    # 封面环节（尝试玩 + 截图）的总时间预算（秒）：到点就用已截到的最佳帧，
    # 玩不起来就用第一帧，避免拖慢生成、保证用户体验有下限。
    cover_timeout_seconds: int = 10

    # --- CORS（逗号分隔）---
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # --- 存储目录（绝对路径，跟 cwd 无关）---
    @property
    def storage_dir(self) -> Path:
        return BASE_DIR / "storage"

    @property
    def generated_games_dir(self) -> Path:
        return self.storage_dir / "generated_games"

    @property
    def covers_dir(self) -> Path:
        return self.storage_dir / "covers"

    @property
    def uploads_dir(self) -> Path:
        return self.storage_dir / "uploads"

    @property
    def temp_dir(self) -> Path:
        return self.storage_dir / "temp"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# --- 向后兼容：旧代码仍可 `from config import SECRET_KEY` 等 ---
SECRET_KEY = settings.secret_key
OPENAI_API_KEY = settings.openai_api_key
MODEL_BASE_URL = settings.model_base_url
MODEL_NAME = settings.model_name
DATABASE_URL = settings.database_url
