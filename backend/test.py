from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url="http://43.106.115.130:8080/v1"
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {
            "role":"user",
            "content":"hello"
        }
    ]
)

print(
    response.choices[0].message.content
)