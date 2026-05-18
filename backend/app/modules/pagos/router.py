"""Router de Pagos — Endpoints para crear pagos y webhook MercadoPago."""
from fastapi import APIRouter, HTTPException, status

from app.core.uow import UnitOfWork
from app.modules.pagos.schemas import CrearPagoRequest, PagoRead, WebhookMPRequest, IniciarPagoResponse
from app.modules.pagos.service import PagoService

router = APIRouter(prefix="/api/v1/pagos", tags=["Pagos"])


@router.post("/crear", response_model=IniciarPagoResponse, status_code=status.HTTP_201_CREATED)
def crear_pago(body: CrearPagoRequest):
    """Inicia un pago para un pedido. Retorna init_point para redirigir a MP."""
    with UnitOfWork() as uow:
        try:
            result = PagoService.crear_pago(uow, body)
            uow.commit()
            return result
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.post("/webhook", status_code=status.HTTP_200_OK)
def webhook_mp(body: WebhookMPRequest):
    """Recibe notificaciones IPN de MercadoPago.

    Mapea estados de MP a transiciones de pedido:
    - approved → Pago APPROVED + Pedido a CONFIRMADO
    - rejected → Pago REJECTED (pedido sigue PENDIENTE)
    - pending/in_process → Pago IN_PROCESS
    - cancelled → Pago CANCELLED
    """
    with UnitOfWork() as uow:
        try:
            # Extraer datos del webhook (formato varía según tipo de notificación)
            mp_payment_id = body.data.get("id") or body.id
            mp_status_raw = body.data.get("status", body.action or "unknown")

            # Mapear estado de MP a formato interno
            mp_status_map = {
                "payment.created": "PENDING",
                "payment.updated": "PENDING",
                "approved": "APPROVED",
                "rejected": "REJECTED",
                "in_process": "IN_PROCESS",
                "pending": "PENDING",
                "cancelled": "CANCELLED",
                "refunded": "REFUNDED",
                "chargeback": "CHARGEBACK",
            }
            mp_status = mp_status_map.get(mp_status_raw, mp_status_raw.upper())

            PagoService.process_webhook(uow, str(mp_payment_id), mp_status)
            uow.commit()
            return {"status": "ok"}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/pedido/{pedido_id}", response_model=list[PagoRead])
def get_pagos_by_pedido(pedido_id: int):
    """Obtiene los pagos de un pedido."""
    with UnitOfWork() as uow:
        return PagoService.get_by_pedido(uow, pedido_id)


@router.post("/pedido/{pedido_id}/sync", response_model=PagoRead | None)
def sync_pago(pedido_id: int):
    """Consulta MP para sincronizar el estado del pago sin depender del webhook.

    Útil en desarrollo local (sin ngrok). Si el pago está APPROVED en MP,
    actualiza el estado local y transiciona el pedido a CONFIRMADO.
    """
    with UnitOfWork() as uow:
        try:
            pago = PagoService.sync_from_mp(uow, pedido_id)
            uow.commit()
            return pago
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))