"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TagList from "@/components/TagList";


export default function GameDetailPage() {

const params = useParams();

const [game, setGame] = useState<any>(null);

useEffect(() => {


if (params?.id) {
  loadGame();
}


}, [params]);

async function loadGame() {


const response = await fetch(
  `http://127.0.0.1:8000/games/${params.id}`
);

const data = await response.json();

setGame(data);


}

if (!game) {


return (
  <main
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f8fafc"
    }}
  >
    <h2>Loading...</h2>
  </main>
);


}

return (


<main
  style={{
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#f8fafc,#eef2ff)",
    padding: "40px"
  }}
>

  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      position: "relative"
    }}
  >

    <button
      onClick={() =>
        window.location.href = "/"
      }
      style={{
        position: "absolute",
        top: "360px",
        right: "32px",

        padding: "10px 18px",

        border: "none",

        borderRadius: "10px",

        background:
          "linear-gradient(90deg,#6366f1,#8b5cf6)",

        color: "white",

        boxShadow:
          "0 6px 16px rgba(99,102,241,0.35)",

        cursor: "pointer",

        fontWeight: "600",

        zIndex: 10
      }}
    >
      ← Back
    </button>

    <div
      style={{
        background: "white",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.08)"
      }}
    >

      <img
        src={
          game.cover_url ||
          "https://placehold.co/1200x350?text=AI+Game"
        }
        alt={game.title}
        style={{
          width: "100%",
          height: "320px",
          objectFit: "cover"
        }}
      />

      <div
        style={{
          padding: "32px"
        }}
      >

        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px"
          }}
        >
          🎮 {game.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "16px"
          }}
        >
          By {game.author || "AI Creator"}
        </p>

        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.8",
            marginBottom: "24px"
          }}
        >
          {game.description}
        </p>

        <TagList tags={game.tags} />

        <div
          style={{
            marginTop: "18px",
            marginBottom: "18px",
            fontWeight: "bold",
            fontSize: "18px"
          }}
        >
          {
            game.status === "COMPLETED"
              ? "🟢 COMPLETED"
              : game.status === "GENERATING"
              ? "🟡 GENERATING"
              : "🔴 FAILED"
          }
        </div>

        <h2
          style={{
            marginBottom: "16px"
          }}
        >
          🎮 Live Preview
        </h2>

        <iframe
          src={
            `http://127.0.0.1:8000${game.play_url}`
          }
          style={{
            width: "100%",
            height: "700px",
            border: "none",
            borderRadius: "20px",
            background: "white",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.08)"
          }}
        />

        <div
          style={{
            textAlign: "center",
            marginTop: "32px"
          }}
        >

          <button
            onClick={() =>
              window.open(
                `http://127.0.0.1:8000${game.play_url}`
              )
            }
            style={{
              width: "280px",
              height: "70px",
              border: "none",
              borderRadius: "18px",
              background:
                "linear-gradient(90deg,#6366f1,#8b5cf6)",
              color: "white",
              fontSize: "22px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow:
                "0 10px 25px rgba(99,102,241,0.35)"
            }}
          >
            ▶ Play Game
          </button>

        </div>

      </div>

    </div>

  </div>

</main>

);

}
