"""Cover Agent：从截到的帧里挑一张当封面。

策略：游戏"玩起来"后画面会明显变化，所以挑**与初始帧差异最大**的那一帧，
即最可能是"进行中"的画面。如果所有帧都跟初始帧差不多（游戏没动起来 / 超时
只截到初始帧），就用初始帧——保证永远有图。

差异检测用 Pillow；没装 Pillow 时退回"文件体积最大"的简单启发式。
"""

import os

# 差异阈值（0~1）：低于这个值认为画面没实质变化，用初始帧。可调。
MOTION_THRESHOLD = 0.03
_THUMB = (64, 64)


def _difference(path_a: str, path_b: str) -> float:
    """两张图缩小后的灰度平均差异，归一化到 0~1。"""
    from PIL import Image, ImageChops, ImageStat

    a = Image.open(path_a).convert("L").resize(_THUMB)
    b = Image.open(path_b).convert("L").resize(_THUMB)
    diff = ImageChops.difference(a, b)
    return ImageStat.Stat(diff).mean[0] / 255.0


def select_gameplay_cover(frames: list[str], initial: str) -> str:
    candidates = [f for f in frames if f != initial and os.path.exists(f)]
    if not candidates:
        return initial

    try:
        best, best_score = initial, 0.0
        for f in candidates:
            score = _difference(initial, f)
            if score > best_score:
                best, best_score = f, score
        # 画面相对初始帧变化够大 → 用它（进行中）；否则用初始帧
        return best if best_score >= MOTION_THRESHOLD else initial
    except Exception:
        # 没有 Pillow 或读图失败：退回文件体积最大的帧
        try:
            return max(frames, key=os.path.getsize)
        except Exception:
            return initial
