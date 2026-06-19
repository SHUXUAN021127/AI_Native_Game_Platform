from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from database.db import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    file_url = Column(
        String,
        nullable=False
    )

    creator_id = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    status = Column(
        String,
        default="PENDING"
    )

    author = Column(
        String,
        nullable=True
    )

    tags = Column(
        String,
        nullable=True
    )

    cover_url = Column(
        String,
        nullable=True
    )

    generation_logs = Column(
        Text,
        nullable=True
    )