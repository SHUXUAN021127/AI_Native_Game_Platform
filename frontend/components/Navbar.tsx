"use client";

// 视觉与原版一致，登录状态用 useAuth；admin 角色多一个 Admin 入口。

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthContext";

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header
      style={{
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        padding: "16px 40px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: "bold",
            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          🎮 AI Platform
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <Link href="/">Home</Link>

          {(role === "creator" || role === "admin") && (
            <Link href="/create">Create</Link>
          )}

          <Link href="/my-games">My Games</Link>

          <Link href="/history">📜 History</Link>

          {role === "admin" && <Link href="/admin">🛠 Admin</Link>}

          {isAuthenticated ? (
            <>
              <span style={{ color: "#64748b" }}>👤 {user?.email}</span>

              <span>
                {role === "admin"
                  ? "👑 Admin"
                  : role === "creator"
                  ? "🎮 Creator"
                  : "👤 Player"}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  background: "linear-gradient(90deg,#ef4444,#dc2626)",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}