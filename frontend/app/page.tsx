"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { assetUrl } from "@/lib/http";
import type { Game } from "@/lib/types";
import { gradientText, theme } from "@/lib/theme";

import GameCard from "@/components/GameCard";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [recent, setRecent] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // 合并成一个 effect；原来写了两个、loadGames 被调了两次
  useEffect(() => {
    gamesApi.list().then(setGames).catch(() => setGames([]));
    gamesApi.recent().then(setRecent).catch(() => setRecent([]));
  }, []);

  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    if (!kw) return games;
    return games.filter((g) =>
      [g.title, g.description, g.tags]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(kw))
    );
  }, [games, search]);

  async function play(game: Game) {
    try {
      await gamesApi.play(game.id);
    } finally {
      const url = assetUrl(game.play_url);
      if (url) window.open(url, "_blank");
    }
  }

  function gameActions(game: Game) {
    return (
      <>
        <button onClick={() => play(game)} style={playButtonStyle}>
          ▶ Play
        </button>
        <button
          onClick={() => router.push(`/game/${game.id}`)}
          style={detailButtonStyle}
        >
          Details
        </button>
      </>
    );
  }

  return (
    <main style={{ padding: "40px", background: theme.color.pageBg, minHeight: "100vh" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "52px", fontWeight: "bold", marginBottom: "12px", ...gradientText }}>
          🎮 AI Native Game Platform
        </h1>
        <p style={{ color: theme.color.textMuted, fontSize: "18px" }}>
          Create, publish and play AI-generated games
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search by title, tags or description…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          height: "60px",
          padding: "0 20px",
          borderRadius: theme.radius.xl,
          border: `1px solid ${theme.color.border}`,
          fontSize: "18px",
          marginBottom: "32px",
          boxSizing: "border-box",
        }}
      />

      {/* Recently added —— 原来拉取了却没渲染，这里补上 */}
      {!search && recent.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>🆕 Recently added</h2>
          <div style={gridStyle}>
            {recent.map((g) => (
              <GameCard key={g.id} game={g} actions={gameActions(g)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All games</h2>
        {filtered.length === 0 ? (
          <p style={{ color: theme.color.textMuted }}>
            {search ? "No games match your search." : "No games yet. Be the first to create one."}
          </p>
        ) : (
          <div style={gridStyle}>
            {filtered.map((g) => (
              <GameCard key={g.id} game={g} actions={gameActions(g)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
  gap: "24px",
};

const playButtonStyle: React.CSSProperties = {
  flex: 2,
  background: theme.gradient.success,
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontWeight: "bold",
};

const detailButtonStyle: React.CSSProperties = {
  flex: 1,
  background: theme.gradient.primary,
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontWeight: "bold",
};
