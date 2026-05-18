"""Service de Pagos — Lógica de negocio e integración MercadoPago."""
import uuid

from app.core.uow import UnitOfWork
from app.core.mp import crear_preferencia_pago, get_mp_sdk
from app.modules.pagos.schemas import CrearPagoRequest, IniciarPagoResponse
from app.models.all_models import Pago
from app.modules.pedidos.service import PedidoService


class PagoService:

    @staticmethod
    def crear_pago(uow: UnitOfWork, data: CrearPagoRequest) -> IniciarPagoResponse:
        """Crea un registro de pago y una preferencia en MercadoPago.

        Steps:
        1. Verificar que el pedido existe y está en PENDIENTE
        2. Crear registro de pago local con mp_status="PENDING"
        3. Crear preferencia en MercadoPago vía SDK
        4. Almacenar mp_payment_id devuelto por MP
        5. Retornar init_point + datos del pago

        Raises:
            ValueError: Si el pedido no existe o el pago falla.
            RuntimeError: Si la API de MP rechaza la solicitud.
        """
        # Verificar que el pedido existe
        pedido = uow.pedidos.get_by_id(data.pedido_id)
        if pedido is None:
            raise ValueError("Pedido no encontrado")

        if pedido.estado_codigo not in ("PENDIENTE",):
            raise ValueError(
                f"El pedido está en estado '{pedido.estado_codigo}' y no puede pagarse"
            )

        # Generar claves de idempotencia
        idempotency_key = str(uuid.uuid4())
        external_reference = f"FS-{data.pedido_id}-{idempotency_key[:8]}"

        # Crear registro de pago local
        pago = Pago(
            pedido_id=data.pedido_id,
            mp_status="PENDING",
            external_reference=external_reference,
            idempotency_key=idempotency_key,
        )
        uow.pagos.create(pago)
        uow.session.flush()

        # Crear preferencia en MercadoPago
        mp_response = crear_preferencia_pago(
            external_reference=external_reference,
            titulo=f"Pedido #{pedido.id} - Food Store",
            cantidad=1,
            precio_unitario=float(pedido.total),
            pedido_id=pedido.id,
        )

        # mp_payment_id queda None hasta que llegue el pago real (vía sync/webhook).
        # El "id" que devuelve preference().create() es el preference_id, NO el payment_id.

        # En modo test MP devuelve sandbox_init_point (checkout simulado).
        # En producción solo existe init_point.
        init_point = mp_response.get("sandbox_init_point") or mp_response.get("init_point", "")
        if not init_point:
            raise RuntimeError("MercadoPago no devolvió un init_point")

        from app.modules.pagos.schemas import PagoRead

        return IniciarPagoResponse(
            pago=PagoRead.model_validate(pago),
            init_point=init_point,
            mp_payment_id=None,
        )

    @staticmethod
    def get_by_pedido(uow: UnitOfWork, pedido_id: int) -> list[Pago]:
        return uow.pagos.get_by_pedido_id(pedido_id)

    @staticmethod
    def sync_from_mp(uow: UnitOfWork, pedido_id: int) -> Pago | None:
        """Consulta MP por external_reference y sincroniza el estado del pago local.

        Útil cuando el webhook no llegó (localhost sin ngrok).
        Si el pago está APPROVED en MP, actualiza el pago y transiciona el pedido a CONFIRMADO.
        """
        pagos = uow.pagos.get_by_pedido_id(pedido_id)
        if not pagos:
            return None

        pago = sorted(pagos, key=lambda p: p.created_at)[-1]

        # Buscar en MP por external_reference
        sdk = get_mp_sdk()
        result = sdk.payment().search({
            "external_reference": pago.external_reference,
            "sort": "date_created",
            "criteria": "desc",
            "limit": 1,
        })
        payments = result.get("response", {}).get("results", [])
        if not payments:
            return pago

        mp_payment = payments[0]
        mp_status_raw = mp_payment.get("status", "").upper()
        mp_payment_id = str(mp_payment.get("id", ""))

        # Siempre sincronizar mp_payment_id con el payment_id real de MP.
        # Antes del primer sync puede estar vacío o tener un valor stale (p.ej. preference_id de
        # versiones previas). Sobrescribir es seguro porque (pedido_id, external_reference) ya
        # identifican unívocamente al pago local.
        if mp_payment_id and mp_payment_id != pago.mp_payment_id:
            pago.mp_payment_id = mp_payment_id
            uow.session.add(pago)
            uow.session.flush()

        # Sincronizar estado si cambió
        if mp_status_raw and mp_status_raw != pago.mp_status:
            return PagoService.process_webhook(uow, mp_payment_id, mp_status_raw)

        return pago

    @staticmethod
    def process_webhook(uow: UnitOfWork, mp_payment_id: str, mp_status: str) -> Pago:
        """Procesa webhook de MercadoPago IPN.

        Actualiza el estado del pago y, si el pago fue aprobado,
        transiciona el pedido a CONFIRMADO.

        Es IDEMPOTENTE: si ya se procesó este mp_payment_id, no duplica.
        """
        from sqlmodel import select
        from app.models.all_models import Pago as PagoModel

        stmt = select(PagoModel).where(PagoModel.mp_payment_id == mp_payment_id)
        pago = uow.session.exec(stmt).first()

        if pago is None:
            raise ValueError(f"Pago con mp_payment_id {mp_payment_id} no encontrado")

        # No reprocesar si ya está en el mismo estado
        if pago.mp_status == mp_status:
            return pago

        # Actualizar estado del pago
        old_status = pago.mp_status
        pago.mp_status = mp_status
        uow.session.add(pago)
        uow.session.flush()

        # Si el pago fue aprobado, transicionar el pedido a CONFIRMADO
        if mp_status == "APPROVED" and old_status != "APPROVED":
            pedido = uow.pedidos.get_by_id(pago.pedido_id)
            if pedido is not None and pedido.estado_codigo == "PENDIENTE":
                PedidoService.transicionar_estado(
                    uow,
                    pedido_id=pedido.id,
                    estado_hasta="CONFIRMADO",
                    usuario_id=pedido.usuario_id,
                    observacion="Pago aprobado vía MercadoPago",
                )

        return pago
