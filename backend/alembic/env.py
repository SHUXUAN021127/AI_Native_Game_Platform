"""Alembic 环境配置。

数据库 URL 和模型 metadata 都从应用本身取，保持单一来源。
对 SQLite 开启 render_as_batch，这样新增外键/唯一约束时 Alembic 会用
"建新表-拷数据-换名"的方式迁移（SQLite 不支持直接 ALTER 这些约束）。
"""

from alembic import context

import models  # noqa: F401  注册所有模型到 metadata
from config import settings
from database.db import Base

config = context.config
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        render_as_batch=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from database.db import engine

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
