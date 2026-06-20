from sqlalchemy import Column
from sqlalchemy import Integer

from database.db import Base

class GameFavorite(Base):

    __tablename__ = "game_favorites"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    game_id = Column(
        Integer,
        nullable=False
    )