"""Repositorio de direcciones — Hereda de BaseRepository[DireccionEntrega]."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import DireccionEntrega


class DireccionEntregaRepository(BaseRepository[DireccionEntrega]):

    def get_by_usuario(self, usuario_id: int, offset: int = 0, limit: int = 100) -> list[DireccionEntrega]:
        """Retorna direcciones de un usuario (excluye eliminadas)."""
        stmt = (
            select(DireccionEntrega)
            .where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.eliminado_en.is_(None),
            )
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def get_principal(self, usuario_id: int) -> Optional[DireccionEntrega]:
        """Retorna la dirección principal de un usuario."""
        stmt = select(DireccionEntrega).where(
            DireccionEntrega.usuario_id == usuario_id,
            DireccionEntrega.es_principal == True,  # noqa: E712
            DireccionEntrega.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()