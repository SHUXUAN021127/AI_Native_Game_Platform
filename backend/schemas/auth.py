from enum import Enum
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class Role(str, Enum):
    player = "player"
    creator = "creator"
    admin = "admin"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    # 安全修复：旧代码 role 是任意字符串，任何人都能注册成 admin。
    # 这里只允许 player / creator。
    role: Literal["player", "creator"] = "player"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role


class TokenPayload(BaseModel):
    sub: str
    email: EmailStr | None = None
    role: Role
    exp: int | None = None
