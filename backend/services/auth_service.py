"""认证工具：密码哈希 + JWT + 依赖。

第 2 批升级：decode_token / get_current_user 改为返回类型化的
TokenPayload（用 .sub / .role / .email 属性访问，替代旧的 dict 下标）。
新增：
- get_optional_user：用于"登录与否都能访问"的接口（列表、详情等）；
- require_roles：角色守卫依赖工厂，把权限判断从路由里抽出来。
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError

from config import settings
from schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------- 密码 ----------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------- token ----------
def create_access_token(
    *,
    user_id: int | str,
    email: str,
    role: str,
    expires_minutes: int | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    payload = {"sub": str(user_id), "email": email, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> TokenPayload:
    try:
        data = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return TokenPayload(**data)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


# ---------- 依赖 ----------
def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    """必须登录；无效/缺失 token 抛 401。"""
    return decode_token(token)


def get_optional_user(
    token: str | None = Depends(oauth2_optional),
) -> TokenPayload | None:
    """登录可选；没带或无效 token 时返回 None，而不是报错。"""
    if not token:
        return None
    try:
        return decode_token(token)
    except HTTPException:
        return None


def require_roles(*roles: str):
    """角色守卫工厂，例：Depends(require_roles("creator", "admin"))。"""

    def dependency(
        user: TokenPayload = Depends(get_current_user),
    ) -> TokenPayload:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return dependency
