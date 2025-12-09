from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

    return app


app = create_app()
