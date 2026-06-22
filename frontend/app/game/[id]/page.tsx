"use client";

import { useParams, useRouter } from "next/navigation";

import { gamesApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePolledGame } from "@/lib/hooks";
import { assetUrl } from "@/lib/http";
import { formatDateTime } from "@/lib/format";
import { STATUS_META, theme } from "@/lib/theme";

import StatusBadge from "@/components/StatusBadge";
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
      <Centered>
        <h2>Couldn't load this game</h2>
        <p style={{ color: theme.color.textMuted }}>{error}</p>
        <button onClick={() => router.push("/")} style={ghostButton}>
          ← Back home
        </button>
      </Centered>
    );
  }

  if (!game) {
    return (
      <Centered>
        <h2>Loading…</h2>
      </Centered>
    );
  }

  const cover = assetUrl(game.cover_url) ?? "https://placehold.co/1200x400";
  const playUrl = assetUrl(game.play_url);
  const generating = game.status === "GENERATING" || game.status === "PENDING";

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageGradient, padding: "32px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <button onClick={() => router.push("/")} style={{ ...ghostButton, marginBottom: "16px" }}>
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
          {/* Banner：封面 + 标题叠加 */}
          <div style={{ position: "relative" }}>
            <img
              src={cover}
              alt={game.title}
              style={{ width: "100%", height: "300px", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(15,23,42,0.85), rgba(15,23,42,0) 60%)",
              }}
            />
            <div style={{ position: "absolute", top: "16px", right: "16px" }}>
              <StatusBadge status={game.status} />
            </div>
            <div style={{ position: "absolute", left: "24px", right: "24px", bottom: "20px", color: "white" }}>
              <h1 style={{ margin: 0, fontSize: "36px", lineHeight: 1.1 }}>{game.title}</h1>
              <p style={{ margin: "6px 0 0", opacity: 0.85 }}>By {game.author || "AI Creator"}</p>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {/* 操作栏 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <button
                onClick={play}
                disabled={!playUrl}
                style={{ ...primaryButton, opacity: playUrl ? 1 : 0.5, cursor: playUrl ? "pointer" : "not-allowed" }}
              >
                ▶ Play
              </button>

              <ToggleButton active={game.liked} onClick={like}>
                ❤️ {game.like_count}
              </ToggleButton>

              <ToggleButton active={game.favorited} onClick={favorite}>
                ⭐ {game.favorite_count}
              </ToggleButton>

              <span style={{ marginLeft: "auto", color: theme.color.amber, fontWeight: 700 }}>
                🔥 {game.play_count} plays
              </span>
            </div>

            {game.description && (
              <p style={{ fontSize: "17px", lineHeight: 1.8, marginTop: "20px" }}>
                {game.description}
              </p>
            )}

            <div style={{ marginTop: "16px" }}>
              <TagList tags={game.tags} />
            </div>

            <p style={{ marginTop: "16px", fontSize: "14px", color: theme.color.textFaint }}>
              🕒 Created {formatDateTime(game.created_at)}
            </p>

            {/* 试玩区 */}
            <div style={{ marginTop: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ margin: 0, fontSize: "22px" }}>🎮 Live preview</h2>
                {playUrl && !generating && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                    <button onClick={refresh} style={toolButton}>
                      ↻ Refresh
                    </button>
                    <button onClick={() => window.open(playUrl, "_blank")} style={toolButton}>
                      ⛶ Fullscreen
                    </button>
                  </div>
                )}
              </div>

              {generating ? (
                <div
                  style={{
                    height: "240px",
                    borderRadius: theme.radius.xxl,
                    border: `1px dashed ${theme.color.border}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    color: theme.color.textMuted,
                    background: theme.color.pageBg,
                  }}
                >
                  <div style={{ fontSize: "28px" }}>⏳</div>
                  <div>{(STATUS_META[game.status] ?? STATUS_META.PENDING).label}</div>
                  <div style={{ fontSize: "13px" }}>
                    The preview appears automatically when it's ready.
                  </div>
                </div>
              ) : playUrl ? (
                <iframe
                  src={playUrl}
                  style={{
                    width: "100%",
                    height: "640px",
                    border: `1px solid ${theme.color.border}`,
                    borderRadius: theme.radius.xxl,
                    background: "white",
                  }}
                />
              ) : (
                <p style={{ color: theme.color.textMuted }}>
                  This game has no playable build yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: theme.radius.md,
        border: `1px solid ${active ? theme.color.amber : theme.color.border}`,
        background: active ? "#fffbeb" : "white",
        color: active ? theme.color.amber : theme.color.textMuted,
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
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

const primaryButton: React.CSSProperties = {
  background: theme.gradient.primary,
  color: "white",
  border: "none",
  padding: "12px 28px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  boxShadow: theme.shadow.primary,
};

const ghostButton: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: theme.radius.md,
  background: theme.gradient.primary,
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const toolButton: React.CSSProperties = {
  padding: "8px 12px",
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.sm,
  background: "white",
  color: theme.color.textMuted,
  cursor: "pointer",
  fontSize: "14px",
};
