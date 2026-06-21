"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gamesApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePolledGame } from "@/lib/hooks";
import { assetUrl, ApiError } from "@/lib/http";
import { gradientText, theme } from "@/lib/theme";

import GameLogs from "@/components/GameLogs";

export default function CreatePage() {
  const router = useRouter();
  const { role, isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  // 跟踪刚创建的游戏：后端异步生成，这里轮询真实状态和日志
  const { game } = usePolledGame(createdId);

  // 守卫：仅 creator / admin
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
    } else if (role !== "creator" && role !== "admin") {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, role]);

  async function createGame() {
    if (!title.trim() || !description.trim()) {
      setError("Add a title and a description first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setCreatedId(null);
    try {
      const created = await gamesApi.create({ title, description });
      setCreatedId(created.id); // 轮询接管，展示真实进度
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Couldn't start generation. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const generating =
    submitting || game?.status === "GENERATING" || game?.status === "PENDING";
  const playUrl = assetUrl(game?.play_url);

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageBg, padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "12px", ...gradientText }}>
          ✨ AI Game Creator
        </h1>
        <p style={{ color: theme.color.textMuted, marginBottom: "32px" }}>
          Describe your idea and let AI build a playable game.
        </p>

        <div
          style={{
            background: theme.color.white,
            borderRadius: theme.radius.xxl,
            padding: "24px",
            boxShadow: theme.shadow.card,
          }}
        >
          <label>Game title</label>
          <input
            placeholder="e.g. Snake Game"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...fieldStyle, marginBottom: "20px" }}
          />

          <label>Game idea</label>
          <textarea
            placeholder="Describe your game…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...fieldStyle, minHeight: "160px" }}
          />

          <UploadGrid />

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            {error && (
              <p style={{ color: theme.color.red, marginBottom: "16px" }}>{error}</p>
            )}
            <button
              onClick={createGame}
              disabled={generating}
              style={{
                width: "360px",
                maxWidth: "100%",
                height: "60px",
                fontSize: "22px",
                fontWeight: "bold",
                border: "none",
                borderRadius: theme.radius.xxl,
                background: generating ? theme.color.textFaint : theme.gradient.primary,
                color: "white",
                cursor: generating ? "default" : "pointer",
                boxShadow: theme.shadow.primary,
              }}
            >
              {generating ? "⏳ Generating…" : "🚀 Generate game"}
            </button>
          </div>
        </div>

        {/* 真实的 agent 日志（来自后端 generation_logs），不再是假的定时器 */}
        {game?.generation_logs && (
          <div
            style={{
              marginTop: "24px",
              background: theme.color.white,
              borderRadius: theme.radius.xxl,
              padding: "20px",
              boxShadow: theme.shadow.card,
            }}
          >
            <h3 style={{ marginBottom: "16px" }}>🤖 Agent workflow</h3>
            <GameLogs logs={game.generation_logs} />
          </div>
        )}

        {game?.status === "COMPLETED" && (
          <div
            style={{
              marginTop: "24px",
              background: theme.color.white,
              borderRadius: theme.radius.xxl,
              padding: "20px",
              boxShadow: theme.shadow.card,
            }}
          >
            <h2>✅ Game created</h2>
            <p>{game.title}</p>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              {playUrl && (
                <button onClick={() => window.open(playUrl, "_blank")} style={successButtonStyle}>
                  ▶ Play game
                </button>
              )}
              <button onClick={() => router.push(`/game/${game.id}`)} style={successButtonStyle}>
                Open details
              </button>
            </div>
          </div>
        )}

        {game?.status === "FAILED" && (
          <div
            style={{
              marginTop: "24px",
              background: "#fef2f2",
              borderRadius: theme.radius.xxl,
              padding: "20px",
            }}
          >
            <h2 style={{ color: theme.color.red }}>Generation failed</h2>
            <p style={{ color: theme.color.textMuted }}>
              Something went wrong while building this game. Edit the idea and try again.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// 文档 / 图片 / 视频上传。这些上传走带鉴权的 uploadApi。
function UploadGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "12px",
        marginTop: "24px",
      }}
    >
      <UploadCard icon="📄" label="Document" accept="*" />
      <UploadCard icon="🖼" label="Image" accept="image/*" />
      <UploadCard icon="🎥" label="Video" accept="video/*" />
    </div>
  );
}

function UploadCard({
  icon,
  label,
  accept,
}: {
  icon: string;
  label: string;
  accept: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      await uploadApi.file(file);
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  const inputId = `upload-${label.toLowerCase()}`;

  return (
    <div
      style={{
        background: theme.color.pageBg,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.xl,
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "32px" }}>{icon}</div>
      <h3>{label}</h3>

      <input
        id={inputId}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null;
          setFile(selected);
          setDone(false);
          if (selected && accept !== "*") {
            setPreview(URL.createObjectURL(selected));
          }
        }}
      />
      <label htmlFor={inputId} style={chooseLabelStyle}>
        Choose {label.toLowerCase()}
      </label>

      {preview && accept.startsWith("image") && (
        <img
          src={preview}
          alt="preview"
          style={{ width: "100%", marginTop: "10px", borderRadius: theme.radius.md, maxHeight: "120px", objectFit: "cover" }}
        />
      )}
      {preview && accept.startsWith("video") && (
        <video controls style={{ width: "100%", marginTop: "10px", borderRadius: theme.radius.md, maxHeight: "120px" }}>
          <source src={preview} />
        </video>
      )}
      {file && accept === "*" && (
        <p style={{ marginTop: "10px", fontSize: "13px", color: theme.color.textMuted }}>
          {file.name}
        </p>
      )}

      <button onClick={upload} disabled={!file || busy} style={uploadButtonStyle}>
        {busy ? "Uploading…" : "Upload"}
      </button>

      {err && <p style={{ color: theme.color.red, marginTop: "8px", fontSize: "13px" }}>{err}</p>}
      {done && <p style={{ color: theme.color.green, marginTop: "8px" }}>✅ Uploaded</p>}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.color.inputBorder}`,
  marginTop: "8px",
  boxSizing: "border-box",
};

const chooseLabelStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "10px",
  padding: "8px 14px",
  borderRadius: theme.radius.sm,
  background: theme.color.primary,
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
};

const uploadButtonStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "8px 14px",
  border: "none",
  borderRadius: theme.radius.sm,
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const successButtonStyle: React.CSSProperties = {
  background: theme.gradient.success,
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontWeight: "bold",
};
