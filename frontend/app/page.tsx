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

  const filteredGames = games.filter((game) =>
  {
    const keyword =
      search.toLowerCase();

    return (
      game.title
        ?.toLowerCase()
        .includes(keyword)

      ||

      game.description
        ?.toLowerCase()
        .includes(keyword)

      ||

      game.tags
        ?.toLowerCase()
        .includes(keyword)
    );
  });

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
          type="text"
          placeholder="🔍 Search by title, tags or description..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: "100%",
            height: "60px",
            padding: "0 20px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            fontSize: "18px"
          }}
        />

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
                game.cover_url
                  ? `http://127.0.0.1:8000${game.cover_url}`
                  : "https://placehold.co/400x250"
              }
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
                ).toLocaleString(
                  "zh-CN",
                  {
                    timeZone: "Asia/Shanghai",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )}
              </p>

              <p
                style={{
                  color: "#f59e0b",
                  fontWeight: "600",
                  marginTop: "6px"
                }}
              >
                🔥 {game.play_count || 0} Plays
              </p>

              <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginTop: "8px",
                    fontWeight: "600"
                  }}
                >
                  <span
                    style={{
                      color:
                        game.liked
                          ? "#ef4444"
                          : "#64748b"
                    }}
                  >
                    ❤️ {game.like_count || 0}
                  </span>

                  <span
                    style={{
                      color:
                        game.favorited
                          ? "#f59e0b"
                          : "#64748b"
                    }}
                  >
                    ⭐ {game.favorite_count || 0}
                  </span>
                </div>

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
                  onClick={async () => {
                      await fetch(
                        `http://127.0.0.1:8000/games/${game.id}/play`,
                        {
                          method: "POST"
                        }
                      );

                      window.open(
                        `http://127.0.0.1:8000${game.play_url}`
                      );
                    }}
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