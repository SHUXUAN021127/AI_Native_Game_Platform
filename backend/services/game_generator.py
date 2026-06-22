"""游戏生成流水线编排：planner → generator → reviewer。

generator 现在同时返回 HTML 和控制说明（controls dict），一并往上传。
"""

from services.agents.generator import generate_html
from services.agents.planner import plan_game
from services.agents.reviewer import review_html


def generate_game_html(
    prompt: str, logs: list[str] | None = None
) -> tuple[str, dict | None]:
    logs = logs if logs is not None else []

    plan = plan_game(prompt)
    logs.append("🧠 Planner Agent: 需求已规划")

    html, controls = generate_html(plan)
    logs.append("🎮 Generator Agent: HTML 与控制说明已生成")

    if not review_html(html):
        logs.append("🔍 Reviewer Agent: 校验未通过")
        raise ValueError("Generated HTML failed review")
    logs.append("🔍 Reviewer Agent: 校验通过")

    return html, controls
