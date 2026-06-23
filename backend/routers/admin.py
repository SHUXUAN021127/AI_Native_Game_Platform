"""admin 后台路由。

整个 router 挂了 require_roles("admin")，所以下面每个接口都默认仅 admin 可访问。
用户的"不能动其他 admin"规则在 admin_service 里。
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from schemas.auth import TokenPayload
from schemas.game import GameRead
from schemas.user import AdminUserView, RoleUpdate
from services import admin_service, game_service
from services.auth_service import get_current_user, require_roles

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_roles("admin"))],
)


@router.get("/users", response_model=list[AdminUserView])
def list_users(db: Session = Depends(get_db)):
    return admin_service.list_users(db)


@router.patch("/users/{user_id}/role", response_model=AdminUserView)
def update_user_role(
    user_id: int,
    body: RoleUpdate,
    db: Session = Depends(get_db),
):
    return admin_service.set_user_role(db, user_id, body.role)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    admin_service.delete_user(db, user_id)
    return {"message": "User deleted"}


@router.get("/games", response_model=list[GameRead])
def list_all_games(
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    games = admin_service.list_all_games(db)
    return [
        game_service.serialize_game(g, db, int(user.sub)) for g in games
    ]
