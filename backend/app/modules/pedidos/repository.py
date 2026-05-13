"""Repositorio de pedidos — Hereda de BaseRepository[Pedido].

Incluye queries específicos para FSM, audit trail y búsqueda con filtros.
"""
from typing import Optional

from sqlalchemy import func
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido, Usuario


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

    def search(
        self,
        q: str | None = None,
        estado: str | None = None,
        desde: str | None = None,
        hasta: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Pedido], int]:
        """Busca pedidos con filtros y paginación server-side.

        Args:
            q: Búsqueda por #pedido exacto o nombre de cliente (ILIKE).
            estado: Filtrar por estado_codigo.
            desde: Fecha desde (ISO).
            hasta: Fecha hasta (ISO).
            page: Número de página (1-indexed).
            limit: Items por página.

        Returns:
            (items, total) — lista paginada y conteo total.
        """
        stmt = select(Pedido)
        count_stmt = select(func.count()).select_from(Pedido)

        if q:
            if q.isdigit():
                stmt = stmt.where(Pedido.id == int(q))
                count_stmt = count_stmt.where(Pedido.id == int(q))
            else:
                stmt = stmt.join(Usuario).where(Usuario.nombre.ilike(f"%{q}%"))
                count_stmt = count_stmt.join(Usuario).where(Usuario.nombre.ilike(f"%{q}%"))

        if estado:
            stmt = stmt.where(Pedido.estado_codigo == estado)
            count_stmt = count_stmt.where(Pedido.estado_codigo == estado)

        if desde:
            stmt = stmt.where(Pedido.created_at >= desde)
            count_stmt = count_stmt.where(Pedido.created_at >= desde)

        if hasta:
            stmt = stmt.where(Pedido.created_at <= hasta)
            count_stmt = count_stmt.where(Pedido.created_at <= hasta)

        total = self.session.exec(count_stmt).one()

        offset = (page - 1) * limit
        stmt = stmt.order_by(Pedido.created_at.desc()).offset(offset).limit(limit)
        items = list(self.session.exec(stmt).all())

        return items, total


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    pass


class HistorialEstadoPedidoRepository(BaseRepository[HistorialEstadoPedido]):
    pass


class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    pass