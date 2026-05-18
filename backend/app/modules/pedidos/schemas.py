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


class PagoEstadoRead(BaseModel):
    """Estado de pago incluido en el pedido."""
    id: int
    mp_status: str
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PedidoRead(BaseModel):
    id: int
    usuario_id: int
    estado_codigo: str
    total: Decimal
    costo_envio: Decimal = Decimal("50.00")
    forma_pago_codigo: str
    direccion_id: Optional[int] = None
    # Address snapshot (RN-PE03)
    direccion_snapshot_alias: Optional[str] = None
    direccion_snapshot_linea1: Optional[str] = None
    direccion_snapshot_linea2: Optional[str] = None
    direccion_snapshot_ciudad: Optional[str] = None
    direccion_snapshot_cp: Optional[str] = None
    notas: Optional[str] = None
    created_at: datetime
    detalles: list[DetallePedidoRead] = []
    historial: list[HistorialEstadoRead] = []
    pagos: list[PagoEstadoRead] = []

    model_config = {"from_attributes": True}


# ── Validación pre-checkout (EPIC 09) ────────────────────────────

class ValidarItemRequest(BaseModel):
    """Item a validar durante pre-checkout."""
    producto_id: int
    cantidad: int = Field(ge=1)
    precio_original: Decimal = Field(max_digits=10, decimal_places=2)


class ValidarItemsRequest(BaseModel):
    """Request body para validar items antes de crear pedido."""
    items: list[ValidarItemRequest] = Field(min_length=1)


class ItemValidado(BaseModel):
    """Resultado de validación de un item."""
    producto_id: int
    nombre: str
    disponible: bool
    hay_stock: bool
    stock_disponible: int = 0
    precio_actual: Decimal
    precio_original: Decimal
    hubo_cambio_precio: bool


class ValidarItemsResponse(BaseModel):
    """Respuesta de validación pre-checkout."""
    valido: bool
    items: list[ItemValidado]
    errores: list[str] = []


# ── Transición de estado ─────────────────────────────────────────

class EstadoUpdateRequest(BaseModel):
    """Request body para transicionar estado de un pedido."""
    estado_hasta: str = Field(max_length=20)
    observacion: Optional[str] = Field(default=None, max_length=500)


# ── List response (Sprint 7) ─────────────────────────────────────

class PedidoListResponse(BaseModel):
    """Respuesta paginada de listado de pedidos."""
    items: list[PedidoRead]
    total: int
    page: int
    limit: int