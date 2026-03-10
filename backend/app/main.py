from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.upload import router as upload_router
from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="NovaSentinel API",
    version="1.0.0",
    description="AI compliance copilot using Amazon Bedrock, Knowledge Bases, and Nova"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(analyze_router, prefix="/api", tags=["analyze"])


@app.get("/")
def root():
    return {
        "message": "NovaSentinel API is running"
    }