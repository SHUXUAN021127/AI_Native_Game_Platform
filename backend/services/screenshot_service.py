"""截图服务：尽量把游戏"玩起来"再截进行中的画面。

拿到 generator 的控制说明（controls）就**精确驱动**：按它给的 start 开始、循环
它给的 keys 操作；拿不到或不全就**退回盲敲常用键**。两者都在时间预算内进行，
到 deadline 立即停止。所有交互包 try/except，坏游戏不会卡死流水线。
"""

import os
import time

from playwright.sync_api import sync_playwright

# 盲敲兜底用的按键
BLIND_START_KEYS = ["Enter", " "]
BLIND_NUDGE_KEYS = [
    "ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", " ", "w", "a", "s", "d",
]

GOTO_TIMEOUT_MS = 8000
FRAME_INTERVAL_MS = 600
MAX_FRAMES = 12

# Playwright 的 press 用 "Space" 而不是 " "；这里做个映射，兼容模型可能给的写法
_KEY_ALIAS = {" ": "Space", "space": "Space", "Spacebar": "Space"}


def _norm_key(k: str) -> str:
    return _KEY_ALIAS.get(k, k)


def _safe(action) -> None:
    try:
        action()
    except Exception:
        pass


def _shot(page, path: str) -> None:
    try:
        page.screenshot(path=path)
    except Exception:
        pass


def _start(page, controls: dict | None) -> None:
    start = (controls or {}).get("start")
    if start:
        if str(start).lower() == "click":
            _safe(lambda: page.mouse.click(640, 360))
        else:
            _safe(lambda: page.keyboard.press(_norm_key(str(start))))
        return
    # 兜底：点中心 + 点 Start/Play 按钮 + 敲开始键
    _safe(lambda: page.mouse.click(640, 360))
    for label in ("Start", "Play", "开始", "START", "PLAY"):
        _safe(
            lambda label=label: page.get_by_text(label, exact=False)
            .first.click(timeout=500)
        )
    for key in BLIND_START_KEYS:
        _safe(lambda key=key: page.keyboard.press(_norm_key(key)))


def _nudge(page, i: int, keys: list[str]) -> None:
    key = keys[i % len(keys)]
    _safe(lambda: page.keyboard.press(_norm_key(key)))


def capture_gameplay(
    game_url: str,
    output_dir: str,
    deadline_seconds: int = 10,
    controls: dict | None = None,
):
    """返回 (frames, initial_frame)。frames[0] 即初始状态帧。"""
    os.makedirs(output_dir, exist_ok=True)
    deadline = time.monotonic() + deadline_seconds
    frames: list[str] = []

    # 操作键：优先用 controls.keys，否则盲敲常用键
    play_keys = [k for k in (controls or {}).get("keys", []) if k] or BLIND_NUDGE_KEYS

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        _safe(lambda: page.goto(game_url, timeout=GOTO_TIMEOUT_MS))
        page.wait_for_timeout(500)

        initial = os.path.join(output_dir, "0.png")
        _shot(page, initial)
        frames.append(initial)

        _start(page, controls)

        i = 1
        while time.monotonic() < deadline and i <= MAX_FRAMES:
            _nudge(page, i, play_keys)
            page.wait_for_timeout(FRAME_INTERVAL_MS)
            fn = os.path.join(output_dir, f"{i}.png")
            _shot(page, fn)
            frames.append(fn)
            i += 1

        _safe(browser.close)

    return frames, initial
