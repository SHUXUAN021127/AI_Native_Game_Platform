from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from schemas.auth import Role


class UserPublic(BaseModel):
    """对外暴露的用户信息——绝不包含 password_hash。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: Role
    avatar_url: str | None = None
    created_at: datetime
