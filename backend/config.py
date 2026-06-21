"""集中式应用配置（根目录 config.py，import 路径不变：`from config import ...`）。

升级点：
- 用 pydantic-settings 做类型校验，SECRET_KEY / OPENAI_API_KEY 缺失会在
  启动时直接报错，而不是运行到一半才拿到 None；
- 存储路径统一用 BASE_DIR 解析成绝对路径，跟启动目录解耦；
- 同时保留旧的模块级常量（SECRET_KEY 等），现有代码
  `from config import OPENAI_API_KEY` 之类无需改动。
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ 目录（本文件就在 backend/config.py）
BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- 安全 ---
    secret_key: str                       # 必填
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # --- 数据库 ---
    database_url: str = "sqlite:///./game_platform.db"

    # --- 模型 / OpenAI ---
    openai_api_key: str                   # 必填
    model_base_url: str | None = None
    model_name: str = "gpt-5.5"

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
