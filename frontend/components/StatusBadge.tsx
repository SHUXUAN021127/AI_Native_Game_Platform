import { STATUS_META } from "@/lib/theme";
import type { GameStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: GameStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "bold",
        background: meta.bg,
      }}
    >
      {status}
    </span>
  );
}
