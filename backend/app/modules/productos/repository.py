"""Repositorio de productos — Hereda de BaseRepository[Producto]."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Producto


class ProductoRepository(BaseRepository[Producto]):

    def get_by_nombre(self, nombre: str) -> Optional[Producto]:
        """Busca producto por nombre (excluye eliminados)."""
        stmt = select(Producto).where(
            Producto.nombre == nombre,
            Producto.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()

    def get_disponibles(self, offset: int = 0, limit: int = 100) -> list[Producto]:
        """Retorna productos disponibles y no eliminados."""
        stmt = (
            select(Producto)
            .where(
                Producto.disponible == True,  # noqa: E712
                Producto.eliminado_en.is_(None),
            )
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())