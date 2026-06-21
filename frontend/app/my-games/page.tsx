"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { assetUrl } from "@/lib/http";
import type { Game } from "@/lib/types";
import { theme } from "@/lib/theme";

import GameCard from "@/components/GameCard";

export default function MyGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
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
      setGames(await gamesApi.myGames());
    } catch {
      setGames([]);
    }
  }

  async function play(game: Game) {
    try {
      await gamesApi.play(game.id);
    } finally {
      // 修复：原来用 game.file_url（后端不返回该字段，会打开 /games-files/undefined）
      const url = assetUrl(game.play_url);
      if (url) window.open(url, "_blank");
    }
  }

  async function remove(game: Game) {
    if (!confirm(`Delete “${game.title}”? This can't be undone.`)) return;
    await gamesApi.remove(game.id);
    load();
  }

  if (!ready) return null;

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageGradient, padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "10px" }}>
          🎮 My Games
        </h1>
        <p style={{ color: theme.color.textMuted, marginBottom: "40px" }}>
          Manage and play the games you've created
        </p>

        {games.length === 0 ? (
          <div
            style={{
              background: theme.color.white,
              borderRadius: theme.radius.xxl,
              padding: "60px",
              textAlign: "center",
              boxShadow: theme.shadow.card,
            }}
          >
            <h2>No games yet</h2>
            <p style={{ color: theme.color.textMuted, marginBottom: "20px" }}>
              Create your first AI game to see it here.
            </p>
            <button onClick={() => router.push("/create")} style={createButtonStyle}>
              Create a game
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: "24px",
            }}
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                actions={
                  <>
                    <button onClick={() => play(game)} style={playButtonStyle}>
                      ▶ Play
                    </button>
                    <button
                      onClick={() => router.push(`/game/${game.id}`)}
                      style={viewButtonStyle}
                    >
                      View
                    </button>
                    <button onClick={() => remove(game)} style={deleteButtonStyle}>
                      🗑
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const playButtonStyle: React.CSSProperties = {
  flex: 2,
  background: theme.gradient.success,
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: theme.radius.lg,
  cursor: "pointer",
  fontWeight: "bold",
};

const viewButtonStyle: React.CSSProperties = {
  flex: 1,
  background: theme.color.white,
  border: `1px solid ${theme.color.border}`,
  padding: "12px",
  borderRadius: theme.radius.lg,
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteButtonStyle: React.CSSProperties = {
  background: theme.color.red,
  color: "white",
  border: "none",
  padding: "12px 14px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontWeight: 600,
};

const createButtonStyle: React.CSSProperties = {
  background: theme.gradient.primary,
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: theme.radius.lg,
  cursor: "pointer",
  fontWeight: "bold",
};
