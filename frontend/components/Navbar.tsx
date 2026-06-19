"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {

  const [loggedIn,
    setLoggedIn] =
    useState(false);

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    setLoggedIn(
      !!token
    );

  }, []);

  function logout() {

    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/login";
  }

  return (
    <nav
      style={{
        display: "flex",
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

      {
        loggedIn
          ? (
            <button
              onClick={logout}
            >
              Logout
            </button>
          )
          : (
            <Link href="/login">
              Login
            </Link>
          )
      }

    </nav>
  );
}