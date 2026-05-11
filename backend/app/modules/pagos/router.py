"""Router de Pagos — Endpoints para crear pagos y webhook MercadoPago."""
from fastapi import APIRouter, HTTPException, status

from app.core.uow import UnitOfWork
from app.modules.pagos.schemas import CrearPagoRequest, PagoRead, WebhookMPRequest
from app.modules.pagos.service import PagoService

router = APIRouter(prefix="/api/v1/pagos", tags=["Pagos"])


@router.post("/crear", response_model=PagoRead, status_code=status.HTTP_201_CREATED)
def crear_pago(body: CrearPagoRequest):
    """Inicia un pago para un pedido."""
    with UnitOfWork() as uow:
        try:
            pago = PagoService.crear_pago(uow, body)
            uow.commit()
            return pago
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/webhook", status_code=status.HTTP_200_OK)
def webhook_mp(body: WebhookMPRequest):
    """Recibe notificaciones IPN de MercadoPago."""
    with UnitOfWork() as uow:
        try:
            mp_payment_id = body.data.get("id") or body.id
            mp_status = body.data.get("status", "unknown")
            PagoService.process_webhook(uow, int(mp_payment_id), mp_status)
            uow.commit()
            return {"status": "ok"}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/pedido/{pedido_id}", response_model=list[PagoRead])
def get_pagos_by_pedido(pedido_id: int):
    """Obtiene los pagos de un pedido."""
    with UnitOfWork() as uow:
        return PagoService.get_by_pedido(uow, pedido_id)