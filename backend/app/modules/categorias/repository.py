"""Repositorio de categorías — Hereda de BaseRepository[Categoria].
Soporta jerarquía recursiva con CTE.
"""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Categoria, Rol


class CategoriaRepository(BaseRepository[Categoria]):

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca categoría por nombre."""
        stmt = select(Categoria).where(
            Categoria.nombre == nombre,
            Categoria.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()

    def get_subcategorias(self, padre_id: int) -> list[Categoria]:
        """Retorna subcategorías directas de una categoría padre."""
        stmt = (
            select(Categoria)
            .where(
                Categoria.padre_id == padre_id,
                Categoria.eliminado_en.is_(None),
            )
        )
        return list(self.session.exec(stmt).all())


class RolRepository(BaseRepository[Rol]):
    pass