from sqlalchemy import Column
from sqlalchemy import Integer

from database.db import Base

class GameLike(Base):

    __tablename__ = "game_likes"

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