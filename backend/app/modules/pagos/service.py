"""Service de Pagos — Lógica de negocio e integración MercadoPago."""
import uuid

from app.core.uow import UnitOfWork
from app.modules.pagos.schemas import CrearPagoRequest
from app.models.all_models import Pago


class PagoService:

    @staticmethod
    def crear_pago(uow: UnitOfWork, data: CrearPagoRequest) -> Pago:
        """Crea un registro de pago con referencia externa única."""
        # Verificar que el pedido existe
        pedido = uow.pedidos.get_by_id(data.pedido_id)
        if pedido is None:
            raise ValueError("Pedido no encontrado")

        # Verificar idempotencia
        idempotency_key = str(uuid.uuid4())
        external_reference = f"FS-{data.pedido_id}-{idempotency_key[:8]}"

        pago = Pago(
            pedido_id=data.pedido_id,
            mp_status="PENDING",
            external_reference=external_reference,
            idempotency_key=idempotency_key,
        )
        return uow.pagos.create(pago)

    @staticmethod
    def get_by_pedido(uow: UnitOfWork, pedido_id: int) -> list[Pago]:
        return uow.pagos.get_by_pedido_id(pedido_id)

    @staticmethod
    def process_webhook(uow: UnitOfWork, mp_payment_id: int, mp_status: str) -> Pago:
        """Procesa webhook de MercadoPago IPN.

        Actualiza el estado del pago basado en la notificación.
        """
        # Buscar pago por mp_payment_id (si ya existe)
        from sqlmodel import select
        from app.models.all_models import Pago as PagoModel

        stmt = select(PagoModel).where(PagoModel.mp_payment_id == mp_payment_id)
        pago = uow.session.exec(stmt).first()

        if pago is None:
            raise ValueError(f"Pago con mp_payment_id {mp_payment_id} no encontrado")

        pago.mp_status = mp_status
        uow.session.add(pago)
        uow.session.flush()
        return pago