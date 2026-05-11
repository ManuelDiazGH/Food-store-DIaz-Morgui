"""Repositorio de pagos — Hereda de BaseRepository[Pago]."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Pago, FormaPago


class PagoRepository(BaseRepository[Pago]):

    def get_by_pedido_id(self, pedido_id: int) -> list[Pago]:
        """Retorna pagos asociados a un pedido."""
        stmt = select(Pago).where(Pago.pedido_id == pedido_id)
        return list(self.session.exec(stmt).all())

    def get_by_external_reference(self, external_reference: str) -> Optional[Pago]:
        """Busca pago por referencia externa (MercadoPago)."""
        stmt = select(Pago).where(Pago.external_reference == external_reference)
        return self.session.exec(stmt).first()

    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[Pago]:
        """Busca pago por clave de idempotencia (evita duplicados)."""
        stmt = select(Pago).where(Pago.idempotency_key == idempotency_key)
        return self.session.exec(stmt).first()


class FormaPagoRepository(BaseRepository[FormaPago]):
    pass