"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

    return <p>Loading...</p>;

  }

  return (
    <main style={{ padding: 20 }}>

      <h1>{game.title}</h1>

      <p>{game.description}</p>

      <p>
        Status: {game.status}
      </p>

      <p>
        Creator: {game.creator_id}
      </p>

      <button
        onClick={() =>
          window.open(
            `http://127.0.0.1:8000${game.play_url}`
          )
        }
      >
        Play Game
      </button>

    </main>
  );
}