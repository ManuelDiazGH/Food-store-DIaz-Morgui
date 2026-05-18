"""Repositorio de pedidos — Hereda de BaseRepository[Pedido].

Incluye queries específicos para FSM, audit trail y búsqueda con filtros.
"""
from datetime import datetime, time, timezone
from typing import Optional

from sqlalchemy import func
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido, Usuario


def _parse_iso_date_start(s: str) -> datetime:
    """Parsea 'YYYY-MM-DD' (o ISO completo) a inicio del día UTC."""
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _parse_iso_date_end(s: str) -> datetime:
    """Parsea 'YYYY-MM-DD' a 23:59:59.999999 UTC para que el día quede incluido."""
    base = datetime.fromisoformat(s)
    if base.tzinfo is None:
        base = base.replace(tzinfo=timezone.utc)
    # Si el caller ya pasó un timestamp con hora distinta a 00:00:00 lo respetamos.
    if base.time() != time(0, 0, 0):
        return base
    return datetime.combine(base.date(), time.max, tzinfo=timezone.utc)


class PedidoRepository(BaseRepository[Pedido]):

    def get_by_usuario(self, usuario_id: int, offset: int = 0, limit: int = 100) -> list[Pedido]:
        """Retorna pedidos de un usuario, ordenados del más reciente al más viejo."""
        stmt = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .order_by(Pedido.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def count_by_usuario(self, usuario_id: int) -> int:
        """Cuenta total de pedidos de un usuario (para paginación)."""
        stmt = select(func.count()).select_from(Pedido).where(Pedido.usuario_id == usuario_id)
        return self.session.exec(stmt).one() or 0

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
            desde_dt = _parse_iso_date_start(desde)
            stmt = stmt.where(Pedido.created_at >= desde_dt)
            count_stmt = count_stmt.where(Pedido.created_at >= desde_dt)

        if hasta:
            # Fin de día inclusivo: "2026-05-18" cubre todo el 18 de mayo.
            hasta_dt = _parse_iso_date_end(hasta)
            stmt = stmt.where(Pedido.created_at <= hasta_dt)
            count_stmt = count_stmt.where(Pedido.created_at <= hasta_dt)

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