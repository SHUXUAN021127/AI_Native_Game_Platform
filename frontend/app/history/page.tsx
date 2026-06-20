"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {

  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      window.location.href =
        "/login";

      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/games/history",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const data =
      await response.json();

    setHistory(data);
  }

  async function retryGame(
      gameId: number
    ) {

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `http://127.0.0.1:8000/games/${gameId}/retry`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      loadHistory();
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
            marginBottom: "12px"
          }}
        >
          📜 Generation History
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "32px"
          }}
        >
          View all generated games
        </p>

        <div
          style={{
            display: "grid",
            gap: "16px"
          }}
        >

          {history.map((game) => (

            <div
              key={game.id}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.08)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between"
                }}
              >

                <h2>
                  {game.title}
                </h2>

                <span
                  style={{
                    padding:
                      "6px 12px",
                    borderRadius:
                      "999px",
                    background:
                      game.status ===
                      "COMPLETED"
                        ? "#dcfce7"
                        : game.status ===
                          "FAILED"
                        ? "#fee2e2"
                        : "#fef3c7"
                  }}
                >
                  {game.status}
                </span>

              </div>

              <p
                style={{
                  color: "#64748b"
                }}
              >
                {game.description}
              </p>

              <p
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  color: "#94a3b8"
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

              <div
                style={{
                  marginTop: "16px"
                }}
              >

                <button
                  onClick={() =>
                    window.location.href =
                      `/game/${game.id}`
                  }
                  style={{
                    border: "none",
                    borderRadius:
                      "10px",
                    padding:
                      "10px 18px",
                    background:
                      "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    color:
                      "white",
                    cursor:
                      "pointer"
                  }}
                >
                  View Details
                </button>

                {
                  game.status ===
                  "FAILED" && (

                    <button
                      onClick={() =>
                        retryGame(
                          game.id
                        )
                      }
                      style={{
                        marginLeft: "10px",
                        border: "none",
                        borderRadius:
                          "10px",
                        padding:
                          "10px 18px",
                        background:
                          "#f59e0b",
                        color:
                          "white",
                        cursor:
                          "pointer"
                      }}
                    >
                      🔄 Retry
                    </button>

                  )
                }

                <details
                  style={{
                    marginTop: "16px"
                  }}
                >

                  <summary
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    🤖 View Agent Logs
                  </summary>

                  <div
                    style={{
                      marginTop: "12px"
                    }}
                  >

                    {
                      game.generation_logs
                        ?.split("\n")
                        .map(
                          (
                            log: string,
                            index: number
                          ) => (

                            <div
                              key={index}
                              style={{
                                padding: "10px",
                                marginBottom: "8px",
                                background: "#f8fafc",
                                borderRadius: "10px"
                              }}
                            >
                              {log}
                            </div>

                          )
                        )
                    }

                  </div>

                </details>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>

  );
}