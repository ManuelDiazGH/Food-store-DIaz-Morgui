"""Router de Pedidos — Endpoints CRUD + FSM de estados."""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.pedidos.schemas import (
    CrearPedidoRequest, PedidoRead, EstadoUpdateRequest,
    ValidarItemsRequest, ValidarItemsResponse, HistorialEstadoRead,
)
from app.modules.pedidos.service import PedidoService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


@router.get("", response_model=list[PedidoRead])
def list_pedidos(
    usuario_id: Optional[int] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
):
    """Lista pedidos. Filtra por usuario si se pasa ?usuario_id=."""
    with UnitOfWork() as uow:
        if usuario_id:
            return PedidoService.get_by_usuario(uow, usuario_id, offset=offset, limit=limit)
        return PedidoService.get_all(uow, offset=offset, limit=limit)


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