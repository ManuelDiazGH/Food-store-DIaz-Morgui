"""Router de Admin — Dashboard y gestión administrativa."""
from fastapi import APIRouter, Depends

from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.modules.admin.schemas import DashboardStats
from app.modules.admin.service import AdminService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats,
            dependencies=[Depends(require_role("ADMIN"))])
def get_dashboard():
    """Obtiene estadísticas del dashboard. Solo ADMIN."""
    with UnitOfWork() as uow:
        return AdminService.get_dashboard_stats(uow)