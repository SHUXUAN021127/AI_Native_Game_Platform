// 设计令牌：把原本复制粘贴在每个页面里的渐变 / 颜色 / 阴影 / 状态色集中到一处。
// 现有视觉不变，但以后想换肤只改这一个文件。

export const theme = {
  color: {
    pageBg: "#f8fafc",
    pageGradient: "linear-gradient(135deg,#f8fafc,#eef2ff)",
    textMuted: "#64748b",
    textFaint: "#94a3b8",
    border: "#e2e8f0",
    inputBorder: "#ddd",
    primary: "#6366f1",
    primaryAccent: "#4f46e5",
    amber: "#f59e0b",
    red: "#ef4444",
    green: "#16a34a",
    tagBg: "#eef2ff",
    white: "#ffffff",
  },
  gradient: {
    primary: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    success: "linear-gradient(90deg,#10b981,#14b8a6)",
    danger: "linear-gradient(90deg,#ef4444,#dc2626)",
  },
  radius: {
    sm: "8px",
    md: "10px",
    lg: "12px",
    xl: "16px",
    xxl: "20px",
    pill: "999px",
  },
  shadow: {
    card: "0 8px 24px rgba(0,0,0,0.08)",
    primary: "0 10px 25px rgba(99,102,241,0.35)",
  },
} as const;

// 状态 → 颜色 / 文案。四处地方原本各写一份三元表达式，统一到这里。
export const STATUS_META: Record<
  string,
  { bg: string; label: string }
> = {
  COMPLETED: { bg: "#dcfce7", label: "🟢 COMPLETED" },
  GENERATING: { bg: "#fef9c3", label: "🟡 GENERATING" },
  FAILED: { bg: "#fee2e2", label: "🔴 FAILED" },
  PENDING: { bg: "#fef9c3", label: "⏳ PENDING" },
};

// 渐变文字（标题那种）复用样式
export const gradientText = {
  background: theme.gradient.primary,
  WebkitBackgroundClip: "text",
  color: "transparent",
} as const;
