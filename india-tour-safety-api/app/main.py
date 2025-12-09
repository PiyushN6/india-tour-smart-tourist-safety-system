from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os

from .core.config import settings
from .db import Base, engine
from .routers import tourists, risk_zones, locations, incidents, alerts, itinerary


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    # CORS
    origins = settings.BACKEND_CORS_ORIGINS or ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(tourists.router, prefix="/api")
    app.include_router(risk_zones.router, prefix="/api")
    app.include_router(locations.router, prefix="/api")
    app.include_router(incidents.router, prefix="/api")
    app.include_router(alerts.router, prefix="/api")
    app.include_router(itinerary.router, prefix="/api")

    @app.on_event("startup")
    def on_startup() -> None:  # noqa: D401
        """Create database tables on startup if they don't exist."""

        Base.metadata.create_all(bind=engine)

    @app.get("/")
    def root() -> dict[str, str]:  # noqa: D401
        """Simple info endpoint."""

        return {"service": settings.PROJECT_NAME, "docs": "/docs"}

    @app.get("/healthz")
    def healthz() -> dict[str, str]:  # noqa: D401
        """Basic liveness endpoint for monitoring."""

        return {"status": "ok", "service": settings.PROJECT_NAME}

    class ChatMessageIn(BaseModel):
        role: str
        content: str

    class ChatRequest(BaseModel):
        messages: List[ChatMessageIn]

    class ChatResponse(BaseModel):
        reply: str

    @app.post("/api/chat", response_model=ChatResponse)
    async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
        """Stub AI chat endpoint.

        Returns a placeholder reply. When you add an OPENAI_API_KEY (or
        compatible) environment variable and real provider integration, this
        function can be updated to call the external AI service.
        """

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return ChatResponse(
                reply=(
                    "AI assistant is not configured yet. Please set API KEY in the backend environment "
                    "to enable AI responses."
                )
            )

        # For now, just echo the last user message content to prove wiring.
        last_content = ""
        if payload.messages:
            last_content = payload.messages[-1].content

        return ChatResponse(
            reply=(
                "This is a placeholder AI reply. The server received: "
                f"'{last_content}'. Replace this logic with a real AI API call."
            )
        )

    return app


app = create_app()
