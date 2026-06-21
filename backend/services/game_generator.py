"""游戏生成流水线编排：planner → generator → reviewer。

改动：把每一步的日志收集起来一并返回，供上层写进 game.generation_logs，
让前端能看到 AI 干活的过程。agents 本身（planner/generator/reviewer）
这一批不动，留待后续单独打磨。
"""

from services.agents.generator import generate_html
from services.agents.planner import plan_game
from services.agents.reviewer import review_html


def generate_game_html(prompt: str, logs: list[str] | None = None) -> str:
    logs = logs if logs is not None else []

    plan = plan_game(prompt)
    logs.append("🧠 Planner Agent: 需求已规划")

    html = generate_html(plan)
    logs.append("🎮 Generator Agent: HTML 已生成")

    if not review_html(html):
        logs.append("🔍 Reviewer Agent: 校验未通过")
        raise ValueError("Generated HTML failed review")
    logs.append("🔍 Reviewer Agent: 校验通过")

    return html
