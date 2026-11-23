from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.explainability import router as explainability_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.loans import router as loans_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router
from app.api.v1.advisor import router as advisor_router

api_router = APIRouter()

# Register all v1 domain routers
api_router.include_router(auth_router)
api_router.include_router(documents_router)
api_router.include_router(transactions_router)
api_router.include_router(predictions_router)
api_router.include_router(explainability_router)
api_router.include_router(forecast_router)
api_router.include_router(loans_router)
api_router.include_router(recommendations_router)
api_router.include_router(reports_router)
api_router.include_router(admin_router)
api_router.include_router(advisor_router)
