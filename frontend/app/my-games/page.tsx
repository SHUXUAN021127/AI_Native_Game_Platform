"use client";

import { useEffect, useState } from "react";

export default function MyGamesPage() {

  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    loadMyGames();
  }, []);

  async function loadMyGames() {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      alert(
        "Please login first"
      );

      window.location.href =
        "/login";

      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/games/my-games",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const data =
      await response.json();

    setGames(data);
  }

  return (
    <main style={{ padding: 20 }}>

      <h1>My Games</h1>

      {
        games.map((game) => (

          <div
            key={game.id}
            style={{
              border:
                "1px solid #ddd",
              padding: 20,
              marginTop: 20
            }}
          >

            <h2>
              {game.title}
            </h2>

            <p>
              {game.description}
            </p>

            <p>
              {
                game.status ===
                "COMPLETED"
                  ? "🟢 COMPLETED"
                  : game.status ===
                    "GENERATING"
                  ? "🟡 GENERATING"
                  : "🔴 FAILED"
              }
            </p>

            <button
              onClick={() =>
                window.open(
                  `http://127.0.0.1:8000/games-files/${game.file_url}`
                )
              }
            >
              Play
            </button>

          </div>

        ))
      }

    </main>
  );
}