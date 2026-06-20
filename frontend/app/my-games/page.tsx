"use client";

import { useEffect, useState } from "react";

export default function MyGamesPage() {

  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    loadMyGames();
  }, []);

    async function deleteGame(
      gameId: number
    ) {

      const confirmed =
        confirm(
          "Delete this game?"
        );

      if (!confirmed) return;

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `http://127.0.0.1:8000/games/${gameId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      loadMyGames();
    }

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

    const data = await response.json();

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    if (Array.isArray(data)) {

      setGames(data);

    } else {

      console.error(
        "Not Array:",
        data
      );

      setGames([]);

    }
  }

  return (
  <main
    style={{
      minHeight: "100vh",
      background:
        "linear-gradient(135deg,#f8fafc,#eef2ff)",
      padding: "40px"
    }}
  >
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "10px"
        }}
      >
        🎮 My Games
      </h1>

      <p
        style={{
          color: "#64748b",
          marginBottom: "40px"
        }}
      >
        Manage and play your generated games
      </p>

      {games.length === 0 ? (

        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "60px",
            textAlign: "center",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.08)"
          }}
        >
          <h2>
            No Games Yet
          </h2>

          <p
            style={{
              color: "#64748b"
            }}
          >
            Create your first AI game.
          </p>
        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(320px,1fr))",
            gap: "24px"
          }}
        >
          {games.map((game) => (

            <div
              key={game.id}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.08)",
                transition:
                  "all 0.2s"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center"
                }}
              >
                <h2
                  style={{
                    fontSize: "22px",
                    margin: 0
                  }}
                >
                  {game.title}
                </h2>

                <span
                  style={{
                    padding:
                      "6px 12px",
                    borderRadius:
                      "999px",
                    fontSize:
                      "12px",
                    fontWeight:
                      "bold",
                    background:
                      game.status ===
                      "COMPLETED"
                        ? "#dcfce7"
                        : game.status ===
                          "GENERATING"
                        ? "#fef9c3"
                        : "#fee2e2"
                  }}
                >
                  {game.status}
                </span>
              </div>

              <p
                style={{
                  marginTop: "16px",
                  color: "#64748b",
                  minHeight: "60px"
                }}
              >
                {game.description}
              </p>

              <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      gap: "12px"
                    }}
                  >

                <button
                  onClick={async () => {

                    await fetch(
                      `http://127.0.0.1:8000/games/${game.id}/play`,
                      {
                        method: "POST"
                      }
                    );

                    window.open(
                      `http://127.0.0.1:8000/games-files/${game.file_url}`
                    );
                  }}
                  style={{
                    flex: 2,
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px",
                    background:
                      "linear-gradient(90deg,#10b981,#14b8a6)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                    boxShadow:
                      "0 6px 16px rgba(16,185,129,0.25)"
                  }}
                >
                  ▶ Play Game
                </button>

                <button
                  onClick={() =>
                    window.location.href =
                      `/game/${game.id}`
                  }
                  style={{
                    flex: 1,
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "14px",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  View
                </button>

                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "12px"
                    }}
                  >

                <button
                  onClick={() =>
                    deleteGame(game.id)
                  }
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 14px",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  🗑 Delete
                </button>

                  </div>

              </div>

            </div>

          ))}
        </div>

      )}
    </div>
  </main>
);
}