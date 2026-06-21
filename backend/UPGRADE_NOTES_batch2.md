# 后端重构 · 第 2 批升级说明

## 安装新依赖
```bash
pip install pydantic-settings alembic
```

## 启动方式不变
在 `backend/` 目录下：
```bash
uvicorn main:app --reload
```

## 关于数据库（重要）
这一批给点赞/收藏加了 `(user_id, game_id)` 唯一约束、给 game 加了真正的外键。
**SQLite 不能直接给已存在的表 ALTER 这些约束**，所以有两条路：

### 方案 A（开发期最简单）：重建数据库
开发数据无所谓的话，删掉旧库让程序重新建表即可：
```bash
rm game_platform.db          # 旧的开发库
uvicorn main:app --reload    # 启动时 create_all 会按新模型重建
```

### 方案 B（要保留数据）：用 Alembic 迁移
```bash
alembic revision --autogenerate -m "add fk and unique constraints"
alembic upgrade head
```
`alembic/env.py` 已开启 `render_as_batch=True`，会用"建新表→拷数据→改名"的方式
在 SQLite 上完成约束变更。生成的迁移脚本建议人工过一眼再 upgrade。

> 注意：如果旧数据里本来就有重复点赞/收藏记录，加唯一约束会失败——
> 先去重再迁移。

## 行为变化速查
- 生成游戏：`POST /games` 现在**立即返回**（202，状态 GENERATING），
  真正的生成在后台跑。前端可轮询 `GET /games/{id}` 看状态变 COMPLETED/FAILED。
- `GET /games/{id}`：找不到返回 **404**（旧版返回 200 + message）。
- `POST /games/{id}/retry`：现在需要登录，且仅作者或 admin 可重试。
- `POST /upload`：现在需要登录，且限制 10MB。
- 注册：不能再自助注册成 admin；重复邮箱返回 409。
- CORS：改为读取 `CORS_ORIGINS`（默认 http://localhost:3000）。
  前端域名变了记得改 `.env`。
