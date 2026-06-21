"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/http";
import { gradientText, theme } from "@/lib/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      login(data.access_token, data.role);
      router.push("/");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? "Email or password is incorrect."
          : "Could not sign in. Check your connection and try again."
      );
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
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: "center",
            color: theme.color.textMuted,
            marginBottom: "30px",
          }}
        >
          Sign in to continue
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ ...inputStyle, marginBottom: "20px" }}
        />

        {error && (
          <p style={{ color: theme.color.red, marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
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
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ color: theme.color.textMuted }}>No account yet?</span>
          <a
            href="/register"
            style={{
              marginLeft: "8px",
              color: theme.color.primary,
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Create one
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
