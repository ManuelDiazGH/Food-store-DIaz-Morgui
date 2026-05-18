"""MercadoPago SDK client singleton.

Configurado con MP_ACCESS_TOKEN desde settings.
Usa el SDK oficial de MercadoPago para crear preferencias de pago.
"""
import mercadopago
from app.core.config import settings

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
        frontend_url = settings.CORS_ORIGINS.split(",")[0].strip()
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
