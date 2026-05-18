"""MercadoPago SDK client singleton.

Configurado con MP_ACCESS_TOKEN desde settings.
Usa el SDK oficial de MercadoPago para crear preferencias de pago.
"""
import hashlib
import hmac
import logging
from typing import Optional

import mercadopago
from app.core.config import settings

logger = logging.getLogger(__name__)

# Singleton del SDK de MercadoPago
# Se inicializa una sola vez con el access token
_sdk: mercadopago.SDK | None = None


def get_mp_sdk() -> mercadopago.SDK:
    """Retorna la instancia singleton del SDK de MercadoPago."""
    global _sdk
    if _sdk is None:
        if not settings.MP_ACCESS_TOKEN:
            raise RuntimeError(
                "MP_ACCESS_TOKEN no está configurado. "
                "Verificá tu archivo .env"
            )
        _sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
    return _sdk


def _frontend_url() -> str:
    """URL base del frontend para back_urls.

    Usa ``FRONTEND_URL`` si está seteada; si no, cae al primer
    origen de ``CORS_ORIGINS`` por compatibilidad.
    """
    if settings.FRONTEND_URL:
        return settings.FRONTEND_URL.rstrip("/")
    return settings.CORS_ORIGINS.split(",")[0].strip().rstrip("/")


def crear_preferencia_pago(
    external_reference: str,
    titulo: str,
    cantidad: int,
    precio_unitario: float,
    pedido_id: int,
    back_urls: dict | None = None,
) -> dict:
    """Crea una preferencia de pago en MercadoPago.

    Args:
        external_reference: Identificador único para tracking.
        titulo: Nombre del producto a mostrar en MP.
        cantidad: Cantidad de unidades.
        precio_unitario: Precio por unidad.
        pedido_id: ID del pedido para el callback.
        back_urls: URLs de retorno (success, failure, pending).

    Returns:
        Dict con la respuesta de la API de MP, incluyendo 'init_point'.

    Raises:
        RuntimeError: Si la API de MP rechaza la solicitud.
    """
    sdk = get_mp_sdk()

    if back_urls is None:
        frontend_url = _frontend_url()
        back_urls = {
            "success": f"{frontend_url}/orders/{pedido_id}?payment=success",
            "failure": f"{frontend_url}/orders/{pedido_id}?payment=failure",
            "pending": f"{frontend_url}/orders/{pedido_id}?payment=pending",
        }

    preference_data = {
        "external_reference": external_reference,
        "items": [
            {
                "title": titulo,
                "quantity": cantidad,
                "unit_price": float(precio_unitario),
                "currency_id": "ARS",
            }
        ],
        "back_urls": back_urls,
    }

    # Solo incluir notification_url si es una URL pública (no localhost)
    # MP rechaza la preferencia si la URL no es accesible públicamente vía HTTPS
    webhook_base = settings.MP_WEBHOOK_BASE_URL
    if webhook_base and "localhost" not in webhook_base and "127.0.0.1" not in webhook_base:
        preference_data["notification_url"] = f"{webhook_base}/api/v1/pagos/webhook"

    result = sdk.preference().create(preference_data)

    if result.get("status") not in (200, 201):
        error_detail = result.get("response", {}).get("message", "Error desconocido de MercadoPago")
        raise RuntimeError(f"Error al crear preferencia de pago: {error_detail}")

    return result["response"]


# ── Webhook signature verification ──────────────────────────────────

def _parse_signature_header(x_signature: str) -> tuple[Optional[str], Optional[str]]:
    """Parsea ``x-signature: ts=...,v1=...`` y retorna (ts, v1) o (None, None)."""
    ts: Optional[str] = None
    v1: Optional[str] = None
    for part in x_signature.split(","):
        key, _, value = part.strip().partition("=")
        if key == "ts":
            ts = value
        elif key == "v1":
            v1 = value
    return ts, v1


def verify_webhook_signature(
    *,
    x_signature: Optional[str],
    x_request_id: Optional[str],
    data_id: str,
) -> bool:
    """Valida firma HMAC-SHA256 del webhook de MercadoPago.

    Manifest oficial:
        id:{data.id};request-id:{x-request-id};ts:{ts};

    El header ``x-signature`` viene como ``ts=...,v1=<hmac>``.

    Política:
    - Si ``MP_WEBHOOK_SECRET`` está vacío:
        * En producción se considera inválido (debería estar configurado).
        * En desarrollo se loguea y se acepta (para no romper testing local sin ngrok).
    - Si está configurado, se valida con ``hmac.compare_digest``.
    """
    secret = settings.MP_WEBHOOK_SECRET

    if not secret:
        if settings.is_production():
            logger.warning("MP_WEBHOOK_SECRET no configurado en producción — webhook rechazado")
            return False
        logger.warning("MP_WEBHOOK_SECRET no configurado — aceptando webhook en dev sin validar firma")
        return True

    if not x_signature or not x_request_id or not data_id:
        logger.warning("Webhook MP sin headers de firma requeridos")
        return False

    ts, v1 = _parse_signature_header(x_signature)
    if not ts or not v1:
        logger.warning("Header x-signature mal formado")
        return False

    manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"
    expected = hmac.new(
        secret.encode("utf-8"),
        manifest.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, v1):
        logger.warning("Firma del webhook MP no coincide")
        return False

    return True
