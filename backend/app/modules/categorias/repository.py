"""Repositorio de categorías — Hereda de BaseRepository[Categoria].
Soporta jerarquía recursiva con CTE.
"""
from typing import Optional

from sqlalchemy import text
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

    def get_all_active(self) -> list[Categoria]:
        """Retorna TODAS las categorías activas (eliminado_en IS NULL) sin paginación."""
        stmt = select(Categoria).where(Categoria.eliminado_en.is_(None))
        return list(self.session.exec(stmt).all())

    def count_active_subcategorias(self, padre_id: int) -> int:
        """Cuenta subcategorías activas (eliminado_en IS NULL) de una categoría."""
        stmt = (
            select(Categoria)
            .where(
                Categoria.padre_id == padre_id,
                Categoria.eliminado_en.is_(None),
            )
        )
        return len(list(self.session.exec(stmt).all()))

    def is_descendant(self, category_id: int, potential_ancestor_id: int) -> bool:
        """Verifica si category_id es descendiente de potential_ancestor_id usando CTE recursivo.

        Retorna True si potential_ancestor_id es ancestro de category_id
        (o si son el mismo nodo), lo cual crearía un ciclo si se asigna como padre.
        """
        cte_sql = text("""
            WITH RECURSIVE ancestors AS (
                -- Caso base: partir de category_id
                SELECT id, padre_id FROM categoria WHERE id = :category_id
                UNION ALL
                -- Paso recursivo: subir por padre_id
                SELECT c.id, c.padre_id
                FROM categoria c
                INNER JOIN ancestors a ON c.id = a.padre_id
            )
            SELECT COUNT(*) FROM ancestors WHERE id = :potential_ancestor_id
        """)
        result = self.session.exec(
            cte_sql,
            params={
                "category_id": category_id,
                "potential_ancestor_id": potential_ancestor_id,
            },
        )
        # result es un ScalarResult, obtener el count
        count = result.scalar()
        return count > 0


class RolRepository(BaseRepository[Rol]):
    pass