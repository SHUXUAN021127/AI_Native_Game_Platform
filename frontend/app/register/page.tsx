"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/http";
import type { Role } from "@/lib/types";
import { gradientText, theme } from "@/lib/theme";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      await authApi.register(email, password, role);
      router.push("/login");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(
          e.status === 409
            ? "That email is already registered."
            : e.message || "Could not create the account."
        );
      } else {
        setError("Could not create the account. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.color.pageBg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "420px",
          background: theme.color.white,
          padding: "32px",
          borderRadius: theme.radius.xxl,
          boxShadow: theme.shadow.card,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "42px",
            marginBottom: "10px",
            ...gradientText,
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: theme.color.textMuted,
            marginBottom: "30px",
          }}
        >
          Join the AI Game Platform
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          style={{ ...inputStyle, padding: "12px" }}
        >
          <option value="player">Player — play games</option>
          <option value="creator">Creator — build and publish games</option>
        </select>

        {error && (
          <p style={{ color: theme.color.red, marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? theme.color.textFaint : theme.gradient.primary,
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: theme.radius.lg,
            cursor: loading ? "default" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ color: theme.color.textMuted }}>
            Already have an account?
          </span>
          <a
            href="/login"
            style={{
              marginLeft: "8px",
              color: theme.color.primary,
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: `1px solid ${theme.color.inputBorder}`,
  marginBottom: "16px",
};
