# API 参考

Base URL：`http://localhost:8000`（本地）。运行后可在 `/docs` 看交互式 Swagger UI。

鉴权：除标注「公开」外，需在请求头带 `Authorization: Bearer <token>`。
token 由 `POST /auth/login` 获得。

---

## Auth

### `POST /auth/register`  （公开）
注册。不允许自助注册 admin。
```json
{ "email": "a@b.com", "password": "至少8位", "role": "player|creator" }
```
- `201` 返回用户公开信息（不含密码哈希）
- `409` 邮箱已存在；`422` 邮箱格式/密码长度不符

### `POST /auth/login`  （公开）
表单登录（OAuth2 password，字段 `username` / `password`）。
- `200` `{ "access_token": "...", "token_type": "bearer", "role": "..." }`
- `401` 凭据错误

---

## Games

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/games/` | 公开（带 token 则含 liked/favorited） | 列出全部游戏 |
| GET | `/games/recent` | 公开 | 最近 3 个 |
| GET | `/games/my-games` | 登录 | 我创建的 |
| GET | `/games/history` | 登录 | 生成历史（admin 看全部） |
| GET | `/games/{id}` | 公开 | 单个游戏；不存在返回 `404` |
| POST | `/games/` | creator/admin | 创建并触发异步生成，返回 `202` + 游戏（status=GENERATING） |
| POST | `/games/{id}/play` | 公开 | 播放计数 +1 |
| POST | `/games/{id}/like` | 登录 | 点赞/取消（toggle） |
| POST | `/games/{id}/favorite` | 登录 | 收藏/取消（toggle） |
| POST | `/games/{id}/retry` | 作者/admin | 重新生成 |
| DELETE | `/games/{id}` | 作者/admin | 删除（连带文件、点赞、收藏） |

游戏对象（`GameRead`）主要字段：
```
id, title, description, status, author, tags, cover_url, play_count,
like_count, favorite_count, liked, favorited, created_at, play_url,
generation_logs, controls{ start, keys[], notes }
```

---

## Upload

### `POST /upload/`  （登录）
上传文件，`multipart/form-data`，字段名 `file`，上限 10MB。
- `201` `{ "filename": "...", "url": "/uploads/..." }`

---

## Admin（整组仅 admin）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/admin/users` | 列出全部用户（含每人游戏数） |
| PATCH | `/admin/users/{id}/role` | 改角色，body `{ "role": "creator" }`；目标若是 admin 返回 `403` |
| DELETE | `/admin/users/{id}` | 删用户（连带其游戏）；目标若是 admin 返回 `403` |
| GET | `/admin/games` | 列出全部游戏 |

> 删除游戏复用 `DELETE /games/{id}`（admin 可删任意游戏）。

---

## 静态资源
- `/games-files/{file}` 生成的游戏 HTML
- `/covers/{file}` 封面
- `/uploads/{file}` 上传文件

前端用 `assetUrl()` 把这些相对路径拼成完整地址。
