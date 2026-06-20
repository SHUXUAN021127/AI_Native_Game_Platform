# Database Design

## users

| Field         | Type     |
| ------------- | -------- |
| id            | Integer  |
| email         | String   |
| password_hash | String   |
| role          | String   |
| created_at    | DateTime |

---

## games

| Field       | Type     |
| ----------- | -------- |
| id          | Integer  |
| title       | String   |
| description | Text     |
| file_url    | String   |
| creator_id  | Integer  |
| status      | String   |
| author      | String   |
| tags        | String   |
| cover_url   | String   |
| play_count  | Integer  |
| created_at  | DateTime |

---

## game_likes

| Field   | Type    |
| ------- | ------- |
| id      | Integer |
| user_id | Integer |
| game_id | Integer |

---

## game_favorites

| Field   | Type    |
| ------- | ------- |
| id      | Integer |
| user_id | Integer |
| game_id | Integer |

---

## Relationships

User

1 → N Games

User

1 → N Likes

User

1 → N Favorites

Game

1 → N Likes

Game

1 → N Favorites
