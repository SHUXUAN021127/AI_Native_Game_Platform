from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="http://43.106.115.130:8080/v1"
)

SYSTEM_PROMPT = """
You are an expert HTML5 game developer.

Return only HTML.

No markdown.
No explanation.
"""


def clean_html(html: str):

    html = html.replace(
        "```html",
        ""
    )

    html = html.replace(
        "```",
        ""
    )

    return html.strip()

def generate_html(plan: str):

    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": plan
            }
        ]
    )

    html_content = (
        response.choices[0]
        .message
        .content
    )

    return clean_html(
        html_content
    )