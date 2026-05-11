"""Repositorio de pedidos — Hereda de BaseRepository[Pedido].

Incluye queries específicos para FSM y audit trail.
"""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido


class PedidoRepository(BaseRepository[Pedido]):

    def get_by_usuario(self, usuario_id: int, offset: int = 0, limit: int = 100) -> list[Pedido]:
        """Retorna pedidos de un usuario."""
        stmt = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    pass


class HistorialEstadoPedidoRepository(BaseRepository[HistorialEstadoPedido]):
    pass


class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    pass