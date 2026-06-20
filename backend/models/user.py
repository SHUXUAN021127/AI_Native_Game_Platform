from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime

from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    role = Column(
        String,
        default="player"
    )

    provider = Column(
        String,
        nullable=True
    )

    github_id = Column(
        String,
        nullable=True
    )

    avatar_url = Column(
        String,
        nullable=True
    )