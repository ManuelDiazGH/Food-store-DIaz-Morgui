"""Schemas de Pagos — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CrearPagoRequest(BaseModel):
    """Request body para iniciar un pago."""
    pedido_id: int
    forma_pago_codigo: str = Field(max_length=20)


class PagoRead(BaseModel):
    id: int
    pedido_id: int
    mp_payment_id: Optional[str] = None
    mp_status: str
    external_reference: str
    idempotency_key: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class IniciarPagoResponse(BaseModel):
    """Respuesta al iniciar un pago con MercadoPago."""
    pago: PagoRead
    init_point: str
    mp_payment_id: Optional[str] = None


class WebhookMPRequest(BaseModel):
    """Webhook payload de MercadoPago IPN."""
    action: str = Field(default="")
    api_version: str = Field(default="")
    data: dict = Field(default_factory=dict)
    id: int = 0
    live_mode: bool = False
    type: str = Field(default="payment")
    user_id: int = 0