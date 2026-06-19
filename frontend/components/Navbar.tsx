"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

  const [loggedIn,
    setLoggedIn] =
    useState(false);

  const [email,
    setEmail] =
    useState("");

  useEffect(() => {

  checkLogin();

  const interval =
    setInterval(
      checkLogin,
      1000
    );

  return () =>
    clearInterval(
      interval
    );

  }, []);

  function checkLogin() {

    const token =
      localStorage.getItem(
        "token"
      );

    setLoggedIn(
      !!token
    );

    if (token) {

      try {

        const payload =
          JSON.parse(
            atob(
              token.split(".")[1]
            )
          );

        setEmail(
          payload.email
        );

      } catch {

        setEmail("");
      }
    }
  }

  function logout() {

  localStorage.removeItem(
    "token"
  );

  setLoggedIn(false);

  setEmail("");

  window.location.href = "/";
  }

  return (

    <header
      style={{
        background: "white",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.05)",
        padding:
          "16px 40px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center"
        }}
      >

        <Link
          href="/"
          style={{
            textDecoration:
              "none",
            fontSize: "24px",
            fontWeight: "bold",
            background:
              "linear-gradient(90deg,#6366f1,#8b5cf6)",
            WebkitBackgroundClip:
              "text",
            color: "transparent"
          }}
        >
          🎮 AI Platform
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}
        >

          <Link href="/">
            Home
          </Link>

          <Link href="/create">
            Create
          </Link>

          <Link href="/my-games">
            My Games
          </Link>

          <Link href="/history">
            📜 History
          </Link>

          {
            loggedIn ? (

              <>
                <span
                  style={{
                    color:
                      "#64748b"
                  }}
                >
                  👤 {email}
                </span>

                <button
                  onClick={
                    logout
                  }
                  style={{
                    background:
                      "linear-gradient(90deg,#ef4444,#dc2626)",
                    color:
                      "white",
                    border:
                      "none",
                    padding:
                      "10px 16px",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer"
                  }}
                >
                  Logout
                </button>
              </>

            ) : (

              <>
                <Link href="/login">
                  Login
                </Link>

                <Link href="/register">
                  Register
                </Link>
              </>

            )
          }

        </div>

      </div>

    </header>

  );
}