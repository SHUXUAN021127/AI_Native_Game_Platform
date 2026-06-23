"""admin 后台的业务逻辑：用户管理 + 全量游戏。

关键规则：admin 可以管理 player / creator，但**不能修改或删除其他 admin**
（也包括自己，因为自己也是 admin）。这条规则集中在 _require_manageable 里，
改角色和删除都先过它，避免规则散落。
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.game import Game
from models.user import User
from schemas.auth import Role
from schemas.user import AdminUserView


def _require_manageable(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user.role == Role.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot manage other admins",
        )
    return user


def _to_view(db: Session, user: User) -> AdminUserView:
    game_count = (
        db.query(Game).filter(Game.creator_id == user.id).count()
    )
    return AdminUserView(
        id=user.id,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        game_count=game_count,
    )


def list_users(db: Session) -> list[AdminUserView]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [_to_view(db, u) for u in users]


def set_user_role(db: Session, user_id: int, role: Role) -> AdminUserView:
    user = _require_manageable(db, user_id)
    user.role = role.value
    db.commit()
    db.refresh(user)
    return _to_view(db, user)


def delete_user(db: Session, user_id: int) -> None:
    user = _require_manageable(db, user_id)
    # 该用户的游戏 / 点赞 / 收藏由模型 cascade 一并删除
    db.delete(user)
    db.commit()


def list_all_games(db: Session) -> list[Game]:
    return db.query(Game).order_by(Game.created_at.desc()).all()
