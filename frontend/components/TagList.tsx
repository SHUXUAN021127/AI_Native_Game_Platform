"use client";

import { theme } from "@/lib/theme";

export default function TagList({
  tags,
  onTagClick,
  activeTag,
}: {
  tags: string | null;
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}) {
  if (!tags) return null;

  const list = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {list.map((tag) => {
        const active = activeTag === tag;
        const style: React.CSSProperties = {
          background: active ? theme.color.primaryAccent : theme.color.tagBg,
          color: active ? "white" : theme.color.primaryAccent,
          padding: "6px 12px",
          borderRadius: theme.radius.pill,
          fontSize: "12px",
          border: "none",
        };

        if (onTagClick) {
          return (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation(); // 避免触发卡片本身的点击
                onTagClick(tag);
              }}
              style={{ ...style, cursor: "pointer" }}
            >
              {tag}
            </button>
          );
        }

        return (
          <span key={tag} style={style}>
            {tag}
          </span>
        );
      })}
    </div>
  );
}
