# 数据模型

ORM：SQLAlchemy 2.0（typed `Mapped`）。默认 SQLite，可切 PostgreSQL。

## 表

### users
| 字段 | 类型 | 说明 |
|---|---|---|
| id | int PK | |
| email | str, unique, indexed | 登录名 |
| password_hash | str | bcrypt 哈希 |
| role | str | player / creator / admin，默认 player |
| provider | str? | 预留（第三方登录） |
| github_id | str? | 预留 |
| avatar_url | str? | |
| created_at | datetime(tz) | |

### games
| 字段 | 类型 | 说明 |
|---|---|---|
| id | int PK | |
| title | str | |
| description | text? | |
| file_url | str | 生成的 HTML 文件名 |
| creator_id | int FK→users.id (CASCADE), indexed | 作者 |
| author | str? | 作者邮箱（冗余展示用） |
| tags | str? | 逗号分隔 |
| cover_url | str? | 封面相对路径 |
| status | str, indexed | PENDING / GENERATING / COMPLETED / FAILED |
| play_count | int | 播放数 |
| generation_logs | text? | agent 过程日志 |
| controls | text? | 控制说明 JSON（start/keys/notes） |
| created_at | datetime(tz), indexed | |

### game_likes
| 字段 | 类型 | 说明 |
|---|---|---|
| id | int PK | |
| user_id | int FK→users.id (CASCADE), indexed | |
| game_id | int FK→games.id (CASCADE), indexed | |
| | UniqueConstraint(user_id, game_id) | 一个用户对一个游戏只能点一次 |

### game_favorites
结构同 `game_likes`（同样的外键与唯一约束）。

## 关系
- User 1—N Game（creator），1—N Like，1—N Favorite，均 `cascade="all, delete-orphan"`。
- Game 1—N Like / Favorite，同样级联。
- 删除用户/游戏会自动清理其关联记录。

## 迁移（Alembic）
模型变更后：
```bash
cd backend
alembic revision --autogenerate -m "描述"
alembic upgrade head
```
`alembic/env.py` 已对 SQLite 开启 `render_as_batch`（支持在 SQLite 上变更约束）。

> 注意：SQLite 不能直接给已存在的表 ALTER 外键/唯一约束。开发期最简单是删库重建
> （`rm game_platform.db` 后启动自动建表）；要保数据则用上面的迁移。
