"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGames } from "../lib/api";

export default function Home() {

  const [games, setGames] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {

    loadGames();

    loadRecentGames();

  }, []);

  async function loadRecentGames() {

      const response =
        await fetch(
          "http://127.0.0.1:8000/games/recent"
        );

      const data =
        await response.json();

      setRecentGames(data);

    }

  async function loadGames() {
    const data = await getGames();
    setGames(data);
  }

  const filteredGames = games.filter(
    (game) =>
      game.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            background:
              "linear-gradient(90deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "12px",
          }}
        >
          🎮 AI Native Game Platform
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "18px",
          }}
        >
          Create, Publish and Play AI Generated Games
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <input
          placeholder="🔍 Search games..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "16px",
          }}
        />

        <Link href="/create">
          <button
            style={{
              background:
                "linear-gradient(90deg,#6366f1,#8b5cf6)",
              color: "white",
              border: "none",
              padding: "14px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🚀 Create Game
          </button>
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(350px,1fr))",
          gap: "24px",
        }}
      >
        {filteredGames.map((game) => (
          <div
            key={game.id}
            style={{
              background: "white",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <img
              src={
                game.cover_url ||
                "https://placehold.co/600x300?text=AI+Game"
              }
              alt={game.title}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                padding: "20px",
              }}
            >
              <h2>{game.title}</h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                By {game.author}
              </p>

              <p>
                {game.description}
              </p>

              <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px"
                  }}
                >
                  {
                    game.tags
                      ?.split(",")
                      .map((tag: string) => (

                        <span
                          key={tag}
                          style={{
                            background: "#eef2ff",
                            color: "#4f46e5",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}
                        >
                          {tag.trim()}
                        </span>

                      ))
                  }
                </div>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Created:
                {" "}
                {new Date(
                  game.created_at
                ).toLocaleString()}
              </p>

              <p
                style={{
                  fontWeight: "bold",
                }}
              >
                {game.status === "COMPLETED"
                  ? "🟢 COMPLETED"
                  : game.status === "GENERATING"
                  ? "🟡 GENERATING"
                  : "🔴 FAILED"}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                <button
                  style={{
                    background:
                      "linear-gradient(90deg,#10b981,#14b8a6)",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.open(
                      `http://127.0.0.1:8000/games-files/${game.file_url}`
                    )
                  }
                >
                  ▶ Play
                </button>

                <button
                  style={{
                    background:
                      "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    (window.location.href =
                      `/game/${game.id}`)
                  }
                >
                  📄 Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}