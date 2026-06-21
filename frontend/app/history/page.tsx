"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Game } from "@/lib/types";
import { theme } from "@/lib/theme";

import GameLogs from "@/components/GameLogs";
import StatusBadge from "@/components/StatusBadge";

export default function HistoryPage() {
  const [history, setHistory] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    load();
    setReady(true);
  }, [loading, isAuthenticated]);

  async function load() {
    try {
      setHistory(await gamesApi.history());
    } catch {
      setHistory([]);
    }
  }

  async function retry(id: number) {
    await gamesApi.retry(id);
    load();
  }

  if (!ready) return null;

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageGradient, padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>📜 Generation History</h1>
        <p style={{ color: theme.color.textMuted, marginBottom: "32px" }}>
          Every game you've generated, newest first
        </p>

        <div style={{ display: "grid", gap: "16px" }}>
          {history.map((game) => (
            <div
              key={game.id}
              style={{
                background: theme.color.white,
                borderRadius: theme.radius.xl,
                padding: "20px",
                boxShadow: theme.shadow.card,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0 }}>{game.title}</h2>
                <StatusBadge status={game.status} />
              </div>

              <p style={{ color: theme.color.textMuted }}>{game.description}</p>

              <p style={{ marginTop: "10px", fontSize: "14px", color: theme.color.textFaint }}>
                Created{" "}
                {game.created_at
                  ? new Date(game.created_at).toLocaleString("zh-CN", {
                      timeZone: "Asia/Shanghai",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>

              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button onClick={() => router.push(`/game/${game.id}`)} style={primaryButtonStyle}>
                  View details
                </button>
                {game.status === "FAILED" && (
                  <button onClick={() => retry(game.id)} style={retryButtonStyle}>
                    🔄 Retry
                  </button>
                )}
              </div>

              <details style={{ marginTop: "16px" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  🤖 View agent logs
                </summary>
                <div style={{ marginTop: "12px" }}>
                  <GameLogs logs={game.generation_logs} />
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: theme.radius.md,
  padding: "10px 18px",
  background: theme.gradient.primary,
  color: "white",
  cursor: "pointer",
};

const retryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: theme.radius.md,
  padding: "10px 18px",
  background: theme.color.amber,
  color: "white",
  cursor: "pointer",
};
