from services.agents.planner import plan_game

from services.agents.generator import generate_html

from services.agents.reviewer import review_html

def generate_game_html(
    prompt: str
):

    plan = plan_game(
        prompt
    )
    print("Planner Agent Running")

    html = generate_html(
        plan
    )
    print("Generator Agent Running")

    valid = review_html(
        html
    )
    print("Reviewer Agent Running")

    if not valid:
        raise Exception(
            "Generated HTML failed review"
        )

    return html