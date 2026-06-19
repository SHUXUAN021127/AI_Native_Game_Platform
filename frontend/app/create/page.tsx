"use client";

import { useState, useEffect } from "react";

export default function CreatePage() {

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

const [loading, setLoading] = useState(false);

const [status, setStatus] = useState("");

const [result, setResult] = useState<any>(null);

useEffect(() => {


const token =
  localStorage.getItem("token");

if (!token) {

  alert("Please login first");

  window.location.href =
    "/login";
}


}, []);

async function createGame() {


try {

  setLoading(true);

  setResult(null);

  setStatus(
    "🧠 Planner Agent Running..."
  );

  await new Promise(
    resolve =>
      setTimeout(resolve, 800)
  );

  setStatus(
    "🎨 Generator Agent Running..."
  );

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

    return;
  }

  const response =
    await fetch(
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

  const data =
    await response.json();

  setStatus(
    "✅ Reviewer Agent Passed"
  );

  setResult(data);

} catch (error) {

  console.error(error);

  setStatus(
    "❌ Generation Failed"
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
    padding: "40px"
  }}
>

  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto"
    }}
  >

    <h1
      style={{
        fontSize: "48px",
        fontWeight: "bold",
        background:
          "linear-gradient(90deg,#6366f1,#8b5cf6)",
        WebkitBackgroundClip:
          "text",
        color: "transparent",
        marginBottom: "12px"
      }}
    >
      ✨ AI Game Creator
    </h1>

    <p
      style={{
        color: "#64748b",
        marginBottom: "32px"
      }}
    >
      Describe your idea and let
      AI build a playable game.
    </p>

    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.08)"
      }}
    >

      <label>
        Game Title
      </label>

      <input
        placeholder="e.g. Snake Game"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border:
            "1px solid #ddd",
          marginTop: "8px",
          marginBottom: "20px"
        }}
      />

      <label>
        Game Idea
      </label>

      <textarea
        placeholder="Describe your game..."
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        style={{
          width: "100%",
          minHeight: "160px",
          padding: "14px",
          borderRadius: "12px",
          border:
            "1px solid #ddd",
          marginTop: "8px"
        }}
      />

      <button
        onClick={createGame}
        disabled={loading}
        style={{
          marginTop: "24px",
          background:
            loading
              ? "#94a3b8"
              : "linear-gradient(90deg,#6366f1,#8b5cf6)",
          color: "white",
          border: "none",
          padding: "14px 24px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        {
          loading
            ? "⏳ Generating..."
            : "🚀 Generate Game"
        }
      </button>

    </div>

    {status && (

      <div
        style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >

        <h3>
          Agent Workflow
        </h3>

        <p>
          {status}
        </p>

      </div>

    )}

    {result && (

      <div
        style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >

        <h2>
          ✅ Game Created
        </h2>

        <p>
          {result.title}
        </p>

        <button
          style={{
            background:
              "linear-gradient(90deg,#10b981,#14b8a6)",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={() =>
            window.open(
              `http://127.0.0.1:8000${result.play_url}`
            )
          }
        >
          ▶ Play Game
        </button>

      </div>

    )}

  </div>

</main>


);
}
