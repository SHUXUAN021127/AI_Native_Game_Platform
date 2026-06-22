"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/http";
import type { AdminUser, Game, Role } from "@/lib/types";
import { gradientText, theme } from "@/lib/theme";

import StatusBadge from "@/components/StatusBadge";

type Tab = "users" | "games";

export default function AdminPage() {
  const router = useRouter();
  const { role, isAuthenticated, loading: authLoading } = useAuth();

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 守卫：仅 admin
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (role !== "admin") {
      router.push("/");
      return;
    }
    void loadAll();
    setReady(true);
  }, [authLoading, isAuthenticated, role]);

  async function loadAll() {
    try {
      const [u, g] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listGames(),
      ]);
      setUsers(u);
      setGames(g);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't load admin data.");
    }
  }

  async function changeRole(user: AdminUser, newRole: Role) {
    setError(null);
    try {
      const updated = await adminApi.setUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't update the role.");
    }
  }

  async function removeUser(user: AdminUser) {
    if (!confirm(`Delete ${user.email}? Their games are removed too. This can't be undone.`))
      return;
    setError(null);
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't delete the user.");
    }
  }

  async function removeGame(game: Game) {
    if (!confirm(`Delete “${game.title}”? This can't be undone.`)) return;
    setError(null);
    try {
      await adminApi.deleteGame(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't delete the game.");
    }
  }

  if (!ready) return null;

  return (
    <main style={{ minHeight: "100vh", background: theme.color.pageGradient, padding: "40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "bold", marginBottom: "6px", ...gradientText }}>
          🛠 Admin Console
        </h1>
        <p style={{ color: theme.color.textMuted, marginBottom: "24px" }}>
          Manage users and every game on the platform.
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            Users ({users.length})
          </TabButton>
          <TabButton active={tab === "games"} onClick={() => setTab("games")}>
            Games ({games.length})
          </TabButton>
        </div>

        {error && (
          <p style={{ color: theme.color.red, marginBottom: "16px" }}>{error}</p>
        )}

        {tab === "users" ? (
          <Panel>
            <p style={{ color: theme.color.textMuted, fontSize: "14px", marginBottom: "16px" }}>
              Admin accounts are protected — their role and removal controls are disabled.
            </p>
            <Table head={["Email", "Role", "Games", "Joined", ""]}>
              {users.map((u) => {
                const isAdmin = u.role === "admin";
                return (
                  <tr key={u.id} style={rowStyle}>
                    <Td>{u.email}</Td>
                    <Td>
                      <select
                        value={u.role}
                        disabled={isAdmin}
                        onChange={(e) => changeRole(u, e.target.value as Role)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: theme.radius.sm,
                          border: `1px solid ${theme.color.border}`,
                          background: isAdmin ? theme.color.pageBg : "white",
                          cursor: isAdmin ? "not-allowed" : "pointer",
                        }}
                      >
                        <option value="player">player</option>
                        <option value="creator">creator</option>
                        <option value="admin">admin</option>
                      </select>
                    </Td>
                    <Td>{u.game_count}</Td>
                    <Td style={{ color: theme.color.textFaint, fontSize: "13px" }}>
                      {new Date(u.created_at).toLocaleDateString("zh-CN")}
                    </Td>
                    <Td>
                      <button
                        onClick={() => removeUser(u)}
                        disabled={isAdmin}
                        title={isAdmin ? "Admins can't be deleted" : "Delete user"}
                        style={{
                          ...dangerButtonStyle,
                          opacity: isAdmin ? 0.4 : 1,
                          cursor: isAdmin ? "not-allowed" : "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          </Panel>
        ) : (
          <Panel>
            <Table head={["Title", "Author", "Status", "Plays", ""]}>
              {games.map((g) => (
                <tr key={g.id} style={rowStyle}>
                  <Td>
                    <a
                      onClick={() => router.push(`/game/${g.id}`)}
                      style={{ color: theme.color.primary, cursor: "pointer", fontWeight: 600 }}
                    >
                      {g.title}
                    </a>
                  </Td>
                  <Td style={{ color: theme.color.textMuted }}>{g.author || "—"}</Td>
                  <Td>
                    <StatusBadge status={g.status} />
                  </Td>
                  <Td>🔥 {g.play_count}</Td>
                  <Td>
                    <button onClick={() => removeGame(g)} style={dangerButtonStyle}>
                      Delete
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>
          </Panel>
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px",
        borderRadius: theme.radius.md,
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        background: active ? theme.gradient.primary : "white",
        color: active ? "white" : theme.color.textMuted,
        boxShadow: active ? theme.shadow.card : "none",
      }}
    >
      {children}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: theme.color.white,
        borderRadius: theme.radius.xxl,
        padding: "24px",
        boxShadow: theme.shadow.card,
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                fontSize: "13px",
                color: theme.color.textFaint,
                borderBottom: `1px solid ${theme.color.border}`,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <td style={{ padding: "12px", ...style }}>{children}</td>;
}

const rowStyle: React.CSSProperties = {
  borderBottom: `1px solid ${theme.color.border}`,
};

const dangerButtonStyle: React.CSSProperties = {
  background: theme.color.red,
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: theme.radius.sm,
  fontWeight: 600,
  cursor: "pointer",
};
