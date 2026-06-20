# API Design

## Authentication

POST /auth/register

Register a new user

POST /auth/login

User login

---

## Game Creation

POST /games

Create a game

GET /games

Get all games

GET /games/recent

Get recent games

GET /games/my-games

Get current user's games

GET /games/history

Get generation history

GET /games/{id}

Get game details

DELETE /games/{id}

Delete a game

---

## Game Interaction

POST /games/{id}/play

Increase play count

POST /games/{id}/like

Toggle like

POST /games/{id}/favorite

Toggle favorite

---

## Response Example

{
"id": 1,
"title": "Snake Game",
"status": "COMPLETED",
"play_count": 20,
"like_count": 8,
"favorite_count": 5
}
