from openai import OpenAI
from config import (
    OPENAI_API_KEY,
    MODEL_BASE_URL
)

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=MODEL_BASE_URL
)

SYSTEM_PROMPT = """
You are a game classification expert.

Generate 3-5 game tags.

Requirements:
- English only
- One word per tag
- Comma separated
- No explanation

Example:

Zombie,Shooter,Action,Survival

Return tags only.
"""


def generate_tags(
    description: str
):

    response = (
        client.chat.completions.create(
            model="gpt-5.5",
            messages=[
                {
                    "role": "system",
                    "content":
                    SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content":
                    description
                }
            ]
        )
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )