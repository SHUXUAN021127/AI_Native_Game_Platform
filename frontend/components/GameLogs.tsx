import { theme } from "@/lib/theme";

// 渲染后端真实的 generation_logs（按行）。历史页、详情页、创建页共用。
export default function GameLogs({ logs }: { logs: string | null }) {
  if (!logs) return null;

  const lines = logs.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return null;

  return (
    <div>
      {lines.map((log, index) => (
        <div
          key={index}
          style={{
            padding: "10px",
            marginBottom: "8px",
            background: theme.color.pageBg,
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.color.border}`,
          }}
        >
          {log}
        </div>
      ))}
    </div>
  );
}
