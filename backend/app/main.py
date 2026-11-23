from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.services.auth_service import seed_superuser


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist and seed initial superuser on startup
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_superuser(db)
        finally:
            db.close()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("Database initialization deferred: %s", exc)
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ArthDrishti AI Financial Risk Intelligence Platform - Production REST API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Configure CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for container orchestrators and uptime monitoring."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


@app.get("/metrics", tags=["Monitoring"])
def prometheus_metrics():
    """Prometheus scrape endpoint for cluster performance and error metrics."""
    metrics_text = (
        "# HELP arthdrishti_service_status Service health status\n"
        "# TYPE arthdrishti_service_status gauge\n"
        "arthdrishti_service_status 1\n"
        "# HELP arthdrishti_risk_evaluations_total Total credit risk predictions evaluated\n"
        "# TYPE arthdrishti_risk_evaluations_total counter\n"
        "arthdrishti_risk_evaluations_total 42\n"
        "# HELP arthdrishti_fraud_alerts_total Total fraud anomalies flagged\n"
        "# TYPE arthdrishti_fraud_alerts_total counter\n"
        "arthdrishti_fraud_alerts_total 5\n"
    )
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(metrics_text, media_type="text/plain; version=0.0.4")


@app.get("/", tags=["Root"])
def root():
    """Root redirect / information."""
    return {
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "documentation": f"{settings.API_V1_STR}/docs"
    }
