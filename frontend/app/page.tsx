"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getGames } from "../lib/api";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    const data = await getGames();
    setGames(data);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>AI Native Game Platform</h1>
      <Link href="/create">
          Create Game
      </Link>

      {games.map((game) => (
        <div
          key={game.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginTop: 20,
          }}
        >
          <h2>{game.title}</h2>

          <p>{game.description}</p>

          <p>
              Status:{
                game.status === "COMPLETED"
                  ? "🟢 COMPLETED"
                  : game.status === "GENERATING"
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
      ))}
    </main>
  );
}