"""Service de Pagos — Lógica de negocio e integración MercadoPago."""
import uuid

from app.core.uow import UnitOfWork
from app.core.mp import crear_preferencia_pago
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

        # Calcular total del pedido para MP
        total_productos = float(pedido.total - (pedido.costo_envio or 0))
        costo_envio = float(pedido.costo_envio or 0)

        # Crear preferencia en MercadoPago
        mp_response = crear_preferencia_pago(
            external_reference=external_reference,
            titulo=f"Pedido #{pedido.id} - Food Store",
            cantidad=1,
            precio_unitario=float(pedido.total),
            pedido_id=pedido.id,
        )

        # Almacenar mp_payment_id devuelto por MP
        mp_payment_id = mp_response.get("id")
        if mp_payment_id:
            pago.mp_payment_id = int(mp_payment_id)
            uow.session.add(pago)

        init_point = mp_response.get("init_point") or mp_response.get("sandbox_init_point", "")
        if not init_point:
            raise RuntimeError("MercadoPago no devolvió un init_point")

        from app.modules.pagos.schemas import PagoRead

        return IniciarPagoResponse(
            pago=PagoRead.model_validate(pago),
            init_point=init_point,
            mp_payment_id=mp_payment_id,
        )

    @staticmethod
    def get_by_pedido(uow: UnitOfWork, pedido_id: int) -> list[Pago]:
        return uow.pagos.get_by_pedido_id(pedido_id)

    @staticmethod
    def process_webhook(uow: UnitOfWork, mp_payment_id: int, mp_status: str) -> Pago:
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
        if mp_status == "approved" and old_status != "approved":
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
