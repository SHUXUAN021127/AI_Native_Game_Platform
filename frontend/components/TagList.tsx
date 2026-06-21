import { theme } from "@/lib/theme";

export default function TagList({ tags }: { tags: string | null }) {
  if (!tags) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((tag) => (
          <span
            key={tag}
            style={{
              background: theme.color.tagBg,
              color: theme.color.primaryAccent,
              padding: "6px 12px",
              borderRadius: theme.radius.pill,
              fontSize: "12px",
            }}
          >
            {tag}
          </span>
        ))}
    </div>
  );
}
