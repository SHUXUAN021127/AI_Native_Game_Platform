"""Generator Agent：产出游戏 HTML，并附带一段控制说明。

用分隔符（而非把 HTML 塞进 JSON）来分两段，避免大段 HTML 被 JSON 转义搞坏：

    ===HTML===
    <完整的 standalone HTML 游戏>
    ===CONTROLS===
    {"start": "Enter", "keys": ["ArrowLeft","ArrowRight","Space"], "notes": "按 Enter 开始，左右移动，空格跳"}

模型没按格式输出时，整段当作 HTML、controls 置空——Cover Agent 会自动退回
盲敲常用键，只会更好不会更差。
"""

import json

from openai import OpenAI

from config import OPENAI_API_KEY, MODEL_BASE_URL

client = OpenAI(api_key=OPENAI_API_KEY, base_url=MODEL_BASE_URL)

HTML_MARKER = "===HTML==="
CONTROLS_MARKER = "===CONTROLS==="

SYSTEM_PROMPT = f"""
You are an expert HTML5 game developer.

Output EXACTLY two sections, in this order, with nothing else (no markdown, no code fences):

{HTML_MARKER}
<the full standalone HTML game>
{CONTROLS_MARKER}
<a single-line JSON object describing how to play>

The CONTROLS JSON must have these fields:
- "start": the single key that begins the game (e.g. "Enter", "Space"), or "click" if a mouse click starts it, or null if it auto-starts.
- "keys": array of keyboard keys used to play, as Playwright key names (e.g. "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "w", "a", "s", "d").
- "notes": one short sentence telling a human how to play.
"""


def _clean_html(html: str) -> str:
    return html.replace("```html", "").replace("```", "").strip()


def _parse_controls(raw: str) -> dict | None:
    text = raw.replace("```json", "").replace("```", "").strip()
    if not text:
        return None
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return None


def _split_output(content: str) -> tuple[str, dict | None]:
    if CONTROLS_MARKER in content:
        html_part, _, controls_part = content.partition(CONTROLS_MARKER)
        html_part = html_part.replace(HTML_MARKER, "")
        return _clean_html(html_part), _parse_controls(controls_part)
    # 兜底：模型没按格式 → 整段当 HTML
    return _clean_html(content.replace(HTML_MARKER, "")), None


def generate_html(plan: str) -> tuple[str, dict | None]:
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": plan},
        ],
    )
    content = response.choices[0].message.content or ""
    return _split_output(content)
