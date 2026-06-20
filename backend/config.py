import os

from dotenv import load_dotenv

load_dotenv(override=True)

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

MODEL_BASE_URL = os.getenv(
    "MODEL_BASE_URL"
)

SECRET_KEY = os.getenv(
    "SECRET_KEY"
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./game_platform.db"
)