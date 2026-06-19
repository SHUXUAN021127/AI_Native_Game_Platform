"use client";

import { useState } from "react";

export default function LoginPage() {

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [loading, setLoading] =
useState(false);

async function login() {



try {

  setLoading(true);

  const formData =
    new URLSearchParams();

  formData.append(
    "username",
    email
  );

  formData.append(
    "password",
    password
  );

  const response =
    await fetch(
      "http://127.0.0.1:8000/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: formData
      }
    );

  if (!response.ok) {

    alert(
      "Invalid Email or Password"
    );

    return;
  }

  const data =
    await response.json();

  localStorage.setItem(
      "token",
      data.access_token
    );

  localStorage.setItem(
      "role",
      data.role
    );

  window.location.href = "/";

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
      Welcome Back
    </h1>

    <p
      style={{
        textAlign: "center",
        color: "#64748b",
        marginBottom: "30px"
      }}
    >
      Login to continue
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
      onClick={login}
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
          ? "⏳ Logging In..."
          : "🚀 Login"
      }
    </button>

  </div>

</main>

);
}
