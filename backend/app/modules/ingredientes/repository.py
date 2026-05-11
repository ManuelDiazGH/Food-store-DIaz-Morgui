"""Repositorio de ingredientes — Hereda de BaseRepository[Ingrediente]."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        """Busca ingrediente por nombre (excluye eliminados)."""
        stmt = select(Ingrediente).where(
            Ingrediente.nombre == nombre,
            Ingrediente.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()

    def get_alergenos(self, offset: int = 0, limit: int = 100) -> list[Ingrediente]:
        """Retorna ingredientes marcados como alérgenos."""
        stmt = (
            select(Ingrediente)
            .where(
                Ingrediente.es_alergeno == True,  # noqa: E712
                Ingrediente.eliminado_en.is_(None),
            )
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())