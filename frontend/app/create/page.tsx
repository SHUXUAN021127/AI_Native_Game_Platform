"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function CreatePage() {
    useEffect(() => {

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {

        alert(
          "Please login first"
        );

        window.location.href =
          "/login";
      }

    }, []);
    const [title, setTitle] = useState("");

    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");


  async function createGame() {

  try {

    setLoading(true);

    const token =
      localStorage.getItem(
        "token"
      );
    if (!token) {

        alert("Please login first");

        window.location.href = "/login";

        return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/games",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          title,
          description
        })
      }
    );

    const data = await response.json();

    console.log(data);

    alert("Game Created!");

      } catch (error) {

        console.error(error);

        alert("Create Failed");

      } finally {

        setLoading(false);

      }
    }

  return (
    <main style={{ padding: 20 }}>
      <h1>Create Game</h1>

      <input
        placeholder="Game Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Describe your game"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <br />
      <br />

      <button
          onClick={createGame}
          disabled={loading}
        >
          {
            loading
              ? "Generating..."
              : "Generate Game"
          }
      </button>
    </main>
  );
}