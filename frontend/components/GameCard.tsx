"use client";

// 首页列表和 my-games 共用的卡片。展示部分统一，操作按钮通过 actions 传入。

import { assetUrl } from "@/lib/http";
import { theme } from "@/lib/theme";
import type { Game } from "@/lib/types";

import StatusBadge from "@/components/StatusBadge";
import TagList from "@/components/TagList";

interface GameCardProps {
  game: Game;
  showCover?: boolean;
  actions?: React.ReactNode;
}

const PLACEHOLDER_COVER = "https://placehold.co/400x250";

export default function GameCard({
  game,
  showCover = true,
  actions,
}: GameCardProps) {
  const cover = assetUrl(game.cover_url) ?? PLACEHOLDER_COVER;

  return (
    <div
      style={{
        background: theme.color.white,
        borderRadius: theme.radius.xxl,
        overflow: "hidden",
        boxShadow: theme.shadow.card,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showCover && (
        <img
          src={cover}
          alt={game.title}
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      )}

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>{game.title}</h2>
          <StatusBadge status={game.status} />
        </div>

        <p style={{ margin: 0, color: theme.color.textMuted, fontSize: "14px" }}>
          By {game.author || "AI Creator"}
        </p>

        <p style={{ margin: 0, minHeight: "40px" }}>{game.description}</p>

        <TagList tags={game.tags} />

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontWeight: 600,
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          <span style={{ color: theme.color.amber }}>
            🔥 {game.play_count}
          </span>
          <span style={{ color: game.liked ? theme.color.red : theme.color.textMuted }}>
            ❤️ {game.like_count}
          </span>
          <span style={{ color: game.favorited ? theme.color.amber : theme.color.textMuted }}>
            ⭐ {game.favorite_count}
          </span>
        </div>

        {actions && (
          <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "12px" }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
