from fastapi import FastAPI

app = FastAPI(
    title="AI Native Game Platform"
)

@app.get("/")
def root():
    return {
        "message": "AI Native Game Platform Running"
    }