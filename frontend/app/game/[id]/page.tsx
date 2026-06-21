"use client";

import { useParams, useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePolledGame } from "@/lib/hooks";
import { assetUrl } from "@/lib/http";
import { STATUS_META, theme } from "@/lib/theme";

import TagList from "@/components/TagList";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? null;

  const { game, error, setGame } = usePolledGame(id);
  const { isAuthenticated } = useAuth();

  async function refresh() {
    if (id) setGame(await gamesApi.get(id));
  }

  async function like() {
    if (!isAuthenticated) return router.push("/login");
    await gamesApi.like(id!);
    refresh();
  }

  async function favorite() {
    if (!isAuthenticated) return router.push("/login");
    await gamesApi.favorite(id!);
    refresh();
  }

  async function play() {
    try {
      await gamesApi.play(id!);
    } finally {
      const url = assetUrl(game?.play_url);
      if (url) window.open(url, "_blank");
      refresh();
    }
  }

  if (error) {
    return (
      <CenteredMessage>
        <h2>Couldn't load this game</h2>
        <p style={{ color: theme.color.textMuted }}>{error}</p>
        <button onClick={() => router.push("/")} style={backButtonStyle}>
          ← Back home
        </button>
      </CenteredMessage>
    );
  }

  if (!game) {
    return (
      <CenteredMessage>
        <h2>Loading…</h2>
      </CenteredMessage>
    );
  }

  const cover = assetUrl(game.cover_url) ?? "https://placehold.co/1200x400";
  const playUrl = assetUrl(game.play_url);

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageGradient, padding: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ ...backButtonStyle, marginBottom: "20px" }}>
          ← Back
        </button>

        <div
          style={{
            background: theme.color.white,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <img
            src={cover}
            alt={game.title}
            style={{ width: "100%", height: "320px", objectFit: "cover" }}
          />

          <div style={{ padding: "32px" }}>
            <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>🎮 {game.title}</h1>
            <p style={{ color: theme.color.textMuted, marginBottom: "16px" }}>
              By {game.author || "AI Creator"}
            </p>
            <p style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "24px" }}>
              {game.description}
            </p>

            <TagList tags={game.tags} />

            <div style={{ marginTop: "18px", marginBottom: "18px", fontWeight: "bold", fontSize: "18px" }}>
              {(STATUS_META[game.status] ?? STATUS_META.PENDING).label}
            </div>

            <div style={{ color: theme.color.amber, fontWeight: 700, fontSize: "18px" }}>
              🔥 {game.play_count} plays
            </div>

            <div style={{ display: "flex", gap: "24px", marginTop: "12px", fontWeight: 600 }}>
              <span onClick={like} style={{ cursor: "pointer", color: game.liked ? theme.color.red : theme.color.textMuted }}>
                ❤️ {game.like_count}
              </span>
              <span onClick={favorite} style={{ cursor: "pointer", color: game.favorited ? theme.color.amber : theme.color.textMuted }}>
                ⭐ {game.favorite_count}
              </span>
            </div>

            {game.status === "GENERATING" ? (
              <p style={{ marginTop: "32px", color: theme.color.textMuted }}>
                ⏳ This game is still being generated. The preview will appear automatically when it's ready.
              </p>
            ) : playUrl ? (
              <>
                <h2 style={{ margin: "32px 0 16px" }}>🎮 Live preview</h2>
                <iframe
                  src={playUrl}
                  style={{
                    width: "100%",
                    height: "700px",
                    border: "none",
                    borderRadius: theme.radius.xxl,
                    background: "white",
                    boxShadow: theme.shadow.card,
                  }}
                />
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                  <button onClick={play} style={bigPlayButtonStyle}>
                    ▶ Play game
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        background: theme.color.pageBg,
      }}
    >
      {children}
    </main>
  );
}

const backButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  border: "none",
  borderRadius: theme.radius.md,
  background: theme.gradient.primary,
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const bigPlayButtonStyle: React.CSSProperties = {
  width: "280px",
  height: "70px",
  border: "none",
  borderRadius: "18px",
  background: theme.gradient.primary,
  color: "white",
  fontSize: "22px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: theme.shadow.primary,
};
