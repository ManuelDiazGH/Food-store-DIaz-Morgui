"""Router de Admin — Dashboard y gestión administrativa."""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.modules.admin.schemas import DashboardStats, MetricasCompletas, PedidoPorEstado, TopProducto, VentaPorPeriodo
from app.modules.admin.service import AdminService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def _parse_fechas(desde: Optional[str], hasta: Optional[str]) -> tuple[str, str]:
    """Valida fechas o usa defaults seguros."""
    if not desde:
        desde = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    if not hasta:
        hasta = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # Validar formato ISO
    try:
        datetime.strptime(desde, "%Y-%m-%d")
        datetime.strptime(hasta, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de fecha inválido. Usá YYYY-MM-DD",
        )
    return desde, hasta


@router.get("/dashboard", response_model=DashboardStats,
            dependencies=[Depends(require_role("ADMIN"))])
def get_dashboard():
    """Obtiene estadísticas del dashboard. Solo ADMIN."""
    with UnitOfWork() as uow:
        return AdminService.get_dashboard_stats(uow)


@router.get("/metricas/completas", response_model=MetricasCompletas,
            dependencies=[Depends(require_role("ADMIN"))])
def get_metricas_completas(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
):
    """Obtiene métricas completas del sistema. Solo ADMIN."""
    desde, hasta = _parse_fechas(desde, hasta)
    with UnitOfWork() as uow:
        resumen = AdminService.get_metricas_resumen(uow)
        return MetricasCompletas(
            **resumen,
            ventas_por_periodo=AdminService.get_ventas_por_periodo(uow, desde, hasta, "dia"),
            top_productos=AdminService.get_top_productos(uow, 10, desde, hasta),
            pedidos_por_estado=AdminService.get_pedidos_por_estado(uow, desde, hasta),
        )


@router.get("/metricas/ventas", response_model=list[VentaPorPeriodo],
            dependencies=[Depends(require_role("ADMIN"))])
def get_ventas_por_periodo(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
    granularidad: str = Query(default="dia"),
):
    """Obtiene ventas agrupadas por período. Solo ADMIN."""
    desde, hasta = _parse_fechas(desde, hasta)
    with UnitOfWork() as uow:
        return AdminService.get_ventas_por_periodo(uow, desde, hasta, granularidad)


@router.get("/metricas/productos-top", response_model=list[TopProducto],
            dependencies=[Depends(require_role("ADMIN"))])
def get_top_productos(
    top: int = Query(default=10, ge=1, le=100),
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
):
    """Obtiene los productos más vendidos. Solo ADMIN."""
    desde, hasta = _parse_fechas(desde, hasta)
    with UnitOfWork() as uow:
        return AdminService.get_top_productos(uow, top, desde, hasta)


@router.get("/metricas/pedidos-por-estado", response_model=list[PedidoPorEstado],
            dependencies=[Depends(require_role("ADMIN"))])
def get_pedidos_por_estado(
    desde: Optional[str] = Query(default=None),
    hasta: Optional[str] = Query(default=None),
):
    """Obtiene distribución de pedidos por estado. Solo ADMIN."""
    desde, hasta = _parse_fechas(desde, hasta)
    with UnitOfWork() as uow:
        return AdminService.get_pedidos_por_estado(uow, desde, hasta)