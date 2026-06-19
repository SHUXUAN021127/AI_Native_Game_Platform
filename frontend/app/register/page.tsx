"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function register() {

    try {

      setLoading(true);

      const response =
        await fetch(
          "http://127.0.0.1:8000/auth/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.detail ||
          "Register Failed"
        );

        return;
      }

      alert(
        "Register Success"
      );

      window.location.href =
        "/login";

    } catch (error) {

      console.error(error);

      alert(
        "Register Failed"
      );

    } finally {

      setLoading(false);

    }
  }

  return (

    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <div
        style={{
          width: "420px",
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            fontSize: "42px",
            marginBottom: "10px",
            background:
              "linear-gradient(90deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip:
              "text",
            color: "transparent"
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "30px"
          }}
        >
          Join the AI Game Platform
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            marginBottom: "16px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            marginBottom: "20px"
          }}
        />

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            background:
              loading
                ? "#94a3b8"
                : "linear-gradient(90deg,#6366f1,#8b5cf6)",
            color: "white",
            border: "none",
            padding: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {
            loading
              ? "⏳ Creating Account..."
              : "✨ Register"
          }
        </button>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center"
          }}
        >
          <span
            style={{
              color: "#64748b"
            }}
          >
            Already have an account?
          </span>

          <a
            href="/login"
            style={{
              marginLeft: "8px",
              color: "#6366f1",
              fontWeight: "bold",
              textDecoration: "none"
            }}
          >
            Login
          </a>
        </div>

      </div>

    </main>

  );
}