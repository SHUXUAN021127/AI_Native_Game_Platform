import sqlite3

conn = sqlite3.connect(
    "game_platform.db"
)

cursor = conn.cursor()

# Like Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS game_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL
)
""")

# Favorite Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS game_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL
)
""")

conn.commit()

print(
    "game_likes and game_favorites created successfully"
)

conn.close()