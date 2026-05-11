"""Schemas de Pedidos — Pydantic v2."""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# ── Detalle ──────────────────────────────────────────────────────

class DetalleItem(BaseModel):
    """Item individual del pedido."""
    producto_id: int
    cantidad: int = Field(ge=1)
    personalizacion: Optional[list[int]] = None


# ── Crear pedido ─────────────────────────────────────────────────

class CrearPedidoRequest(BaseModel):
    """Request body para crear un pedido."""
    forma_pago_codigo: str = Field(max_length=20)
    direccion_id: Optional[int] = None
    notas: Optional[str] = Field(default=None, max_length=1000)
    items: list[DetalleItem] = Field(min_length=1)


class DetallePedidoRead(BaseModel):
    id: int
    producto_id: int
    nombre_snapshot: str
    precio_snapshot: Decimal
    cantidad: int
    personalizacion: Optional[list[int]] = None

    model_config = {"from_attributes": True}


class HistorialEstadoRead(BaseModel):
    id: int
    estado_desde: Optional[str] = None
    estado_hasta: str
    created_at: datetime
    usuario_id: Optional[int] = None
    observacion: Optional[str] = None

    model_config = {"from_attributes": True}


class PedidoRead(BaseModel):
    id: int
    usuario_id: int
    estado_codigo: str
    total: Decimal
    costo_envio: Decimal = Decimal("50.00")
    forma_pago_codigo: str
    direccion_id: Optional[int] = None
    notas: Optional[str] = None
    created_at: datetime
    detalles: list[DetallePedidoRead] = []
    historial: list[HistorialEstadoRead] = []

    model_config = {"from_attributes": True}


# ── Transición de estado ─────────────────────────────────────────

class EstadoUpdateRequest(BaseModel):
    """Request body para transicionar estado de un pedido."""
    estado_hasta: str = Field(max_length=20)
    observacion: Optional[str] = Field(default=None, max_length=500)