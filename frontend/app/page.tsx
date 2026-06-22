"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { assetUrl } from "@/lib/http";
import type { Game } from "@/lib/types";
import { gradientText, theme } from "@/lib/theme";

import GameCard from "@/components/GameCard";

function splitTags(tags: string | null): string[] {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [recent, setRecent] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    gamesApi.list().then(setGames).catch(() => setGames([]));
    gamesApi.recent().then(setRecent).catch(() => setRecent([]));
  }, []);

  // 全部标签按出现频次排序，取前若干个做快捷筛选
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of games) {
      for (const t of splitTags(g.tags)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 16);
  }, [games]);

  // 文本与标签 AND 组合
  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    return games.filter((g) => {
      const textOk =
        !kw ||
        [g.title, g.description, g.tags]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(kw));
      const tagOk = !activeTag || splitTags(g.tags).includes(activeTag);
      return textOk && tagOk;
    });
  }, [games, search, activeTag]);

  function toggleTag(tag: string) {
    setActiveTag((cur) => (cur === tag ? null : tag));
  }

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
        <button onClick={() => router.push(`/game/${game.id}`)} style={detailButtonStyle}>
          Details
        </button>
      </>
    );
  }

  const noFilter = !search && !activeTag;

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
        placeholder="🔍 Search by title, description or tag…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          height: "60px",
          padding: "0 20px",
          borderRadius: theme.radius.xl,
          border: `1px solid ${theme.color.border}`,
          fontSize: "18px",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      />

      {/* 标签筛选栏 */}
      {allTags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: theme.color.textMuted, fontSize: "14px", marginRight: "4px" }}>
            Filter by tag:
          </span>
          {allTags.map((tag) => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "6px 14px",
                  borderRadius: theme.radius.pill,
                  border: `1px solid ${active ? theme.color.primaryAccent : theme.color.border}`,
                  background: active ? theme.color.primaryAccent : "white",
                  color: active ? "white" : theme.color.textMuted,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                #{tag}
              </button>
            );
          })}
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              style={{
                padding: "6px 12px",
                borderRadius: theme.radius.pill,
                border: "none",
                background: theme.color.pageBg,
                color: theme.color.red,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Clear ✕
            </button>
          )}
        </div>
      )}

      {/* Recently added —— 无任何筛选时才显示 */}
      {noFilter && recent.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>🆕 Recently added</h2>
          <div style={gridStyle}>
            {recent.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                actions={gameActions(g)}
                onTagClick={toggleTag}
                activeTag={activeTag}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
          {activeTag ? `Games tagged #${activeTag}` : "All games"}
        </h2>
        {filtered.length === 0 ? (
          <p style={{ color: theme.color.textMuted }}>
            {noFilter
              ? "No games yet. Be the first to create one."
              : "No games match your search."}
          </p>
        ) : (
          <div style={gridStyle}>
            {filtered.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                actions={gameActions(g)}
                onTagClick={toggleTag}
                activeTag={activeTag}
              />
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
