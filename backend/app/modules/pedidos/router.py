"""Router de Pedidos — Endpoints CRUD + FSM de estados."""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.pedidos.schemas import (
    CrearPedidoRequest, PedidoRead, EstadoUpdateRequest,
    ValidarItemsRequest, ValidarItemsResponse, HistorialEstadoRead,
    PedidoListResponse,
)
from app.modules.pedidos.service import PedidoService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


@router.get("", response_model=PedidoListResponse)
def list_pedidos(
    q: Optional[str] = Query(default=None, description="Buscar por #pedido o nombre de cliente"),
    estado: Optional[str] = Query(default=None, description="Filtrar por estado_codigo"),
    desde: Optional[str] = Query(default=None, description="Fecha desde (ISO)"),
    hasta: Optional[str] = Query(default=None, description="Fecha hasta (ISO)"),
    page: int = Query(default=1, ge=1, description="Número de página"),
    limit: int = Query(default=20, ge=1, le=100, description="Items por página"),
    usuario_id: Optional[int] = Query(default=None),
):
    """Lista pedidos con filtros y paginación server-side.

    Si se pasa ?usuario_id=, filtra por usuario (retrocompatibilidad).
    """
    with UnitOfWork() as uow:
        if usuario_id:
            items = PedidoService.get_by_usuario(uow, usuario_id, offset=(page - 1) * limit, limit=limit)
            return PedidoListResponse(items=items, total=len(items), page=page, limit=limit)
        items, total = PedidoService.listar_pedidos(
            uow, q=q, estado=estado, desde=desde, hasta=hasta, page=page, limit=limit,
        )
        return PedidoListResponse(items=items, total=total, page=page, limit=limit)


@router.post("/validar", response_model=ValidarItemsResponse)
def validar_items(body: ValidarItemsRequest):
    """Valida disponibilidad y precios de items antes de crear el pedido (EPIC 09)."""
    with UnitOfWork() as uow:
        items_data = [
            {"producto_id": i.producto_id, "cantidad": i.cantidad, "precio_original": str(i.precio_original)}
            for i in body.items
        ]
        result = PedidoService.validar_items(uow, items_data)
        return result


@router.get("/{id}/historial", response_model=list[HistorialEstadoRead])
def get_historial_pedido(id: int):
    """Retorna el historial de estados de un pedido (audit trail append-only)."""
    with UnitOfWork() as uow:
        try:
            return PedidoService.get_historial(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{id}", response_model=PedidoRead)
def get_pedido(id: int):
    with UnitOfWork() as uow:
        try:
            return PedidoService.get_by_id(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(
    body: CrearPedidoRequest,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Crea un pedido con snapshots y audit trail."""
    with UnitOfWork() as uow:
        try:
            pedido = PedidoService.create(uow, current_user.id, body)
            uow.commit()
            return pedido
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{id}/estado", response_model=PedidoRead)
def transicionar_estado(
    id: int,
    body: EstadoUpdateRequest,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Transiciona el estado de un pedido (FSM validada)."""
    with UnitOfWork() as uow:
        try:
            pedido = PedidoService.transicionar_estado(
                uow, id, body.estado_hasta, current_user.id, body.observacion
            )
            uow.commit()
            return pedido
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))