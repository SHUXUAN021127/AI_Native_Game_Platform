"use client";

// 加载单个游戏，并在它还在生成时自动轮询，直到 COMPLETED / FAILED。
// 详情页和创建页都用它来反映后端的异步生成进度。

import { useEffect, useRef, useState } from "react";

import { gamesApi } from "@/lib/api";
import { ApiError } from "@/lib/http";
import type { Game } from "@/lib/types";

const POLL_INTERVAL_MS = 2500;

export function usePolledGame(id: number | string | null) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id === null || id === undefined) return;

    let active = true;

    async function tick() {
      try {
        const g = await gamesApi.get(id as number | string);
        if (!active) return;
        setGame(g);
        if (g.status === "GENERATING" || g.status === "PENDING") {
          timer.current = setTimeout(tick, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "加载失败");
      }
    }

    tick();

    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  return { game, error, setGame };
}
