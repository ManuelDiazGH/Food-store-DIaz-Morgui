"""Router de Pagos — Endpoints para crear pagos y webhook MercadoPago."""
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user
from app.core.mp import verify_webhook_signature
from app.modules.pagos.schemas import CrearPagoRequest, PagoRead, WebhookMPRequest, IniciarPagoResponse
from app.modules.pagos.service import PagoService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/pagos", tags=["Pagos"])


def _is_staff(user: Usuario) -> bool:
    roles = [ur.rol_codigo for ur in user.roles]
    return "ADMIN" in roles or "PEDIDOS" in roles


def _ensure_pedido_visible(pedido_id: int, current_user: Usuario, uow: UnitOfWork) -> None:
    """Verifica que el usuario pueda ver/operar sobre el pedido."""
    pedido = uow.pedidos.get_by_id(pedido_id)
    if pedido is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")
    if pedido.usuario_id != current_user.id and not _is_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permiso sobre este pedido",
        )


@router.post("/crear", response_model=IniciarPagoResponse, status_code=status.HTTP_201_CREATED)
def crear_pago(
    body: CrearPagoRequest,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Inicia un pago para un pedido. Retorna init_point para redirigir a MP.

    Solo el dueño del pedido (o staff) puede iniciar el pago.
    """
    with UnitOfWork() as uow:
        _ensure_pedido_visible(body.pedido_id, current_user, uow)
        try:
            result = PagoService.crear_pago(uow, body)
            uow.commit()
            return result
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook_mp(
    request: Request,
    body: WebhookMPRequest,
    x_signature: str | None = Header(default=None, alias="x-signature"),
    x_request_id: str | None = Header(default=None, alias="x-request-id"),
):
    """Recibe notificaciones IPN de MercadoPago.

    Valida la firma HMAC del header ``x-signature`` cuando hay
    ``MP_WEBHOOK_SECRET`` configurado. Si la firma no es válida → 401.

    Mapea estados de MP a transiciones de pedido:
    - approved → Pago APPROVED + Pedido a CONFIRMADO
    - rejected → Pago REJECTED (pedido sigue PENDIENTE)
    - pending/in_process → Pago IN_PROCESS
    - cancelled → Pago CANCELLED
    """
    # Extraer ID del data.id para validación de firma
    data_id = str(body.data.get("id") or body.id or "")

    # Validar firma HMAC (si está configurado el secret).
    # En dev sin MP_WEBHOOK_SECRET pasa para no romper testing local, pero loguea.
    if not verify_webhook_signature(
        x_signature=x_signature,
        x_request_id=x_request_id,
        data_id=data_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firma del webhook inválida",
        )

    with UnitOfWork() as uow:
        try:
            mp_payment_id = body.data.get("id") or body.id
            mp_status_raw = body.data.get("status", body.action or "unknown")

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
def get_pagos_by_pedido(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Obtiene los pagos de un pedido. Solo dueño o staff."""
    with UnitOfWork() as uow:
        _ensure_pedido_visible(pedido_id, current_user, uow)
        return PagoService.get_by_pedido(uow, pedido_id)


@router.post("/pedido/{pedido_id}/sync", response_model=PagoRead | None)
def sync_pago(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Consulta MP para sincronizar el estado del pago sin depender del webhook.

    Útil en desarrollo local (sin ngrok). Si el pago está APPROVED en MP,
    actualiza el estado local y transiciona el pedido a CONFIRMADO.

    Solo dueño o staff.
    """
    with UnitOfWork() as uow:
        _ensure_pedido_visible(pedido_id, current_user, uow)
        try:
            pago = PagoService.sync_from_mp(uow, pedido_id)
            uow.commit()
            return pago
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
