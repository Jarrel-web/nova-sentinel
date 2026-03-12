from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="NovaSentinel API",
    version="1.0.0",
    description="AI compliance copilot using Amazon Bedrock, Knowledge Bases, and Nova"
)

# CORS middleware MUST be added first before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers AFTER middleware
app.include_router(health_router)
app.include_router(analyze_router, prefix="/api", tags=["analyze"])


@app.get("/")
def root():
    return {
        "message": "NovaSentinel API is running",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }