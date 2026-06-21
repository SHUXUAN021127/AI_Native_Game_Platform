"""数据库引擎、Session 工厂、Base，以及唯一的 get_db 依赖。

import 路径保持不变：`from database.db import Base, SessionLocal, engine`。
新增 get_db——之前它在 routers/auth.py 和 routers/game.py 各写了一遍，
现在统一到这里一份。
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings

# 仅 SQLite 需要 check_same_thread；换数据库时自动不传
connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(settings.database_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
