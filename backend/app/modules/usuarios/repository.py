"""Repositorio de usuarios — Hereda de BaseRepository[Usuario]."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Usuario, UsuarioRol


class UsuarioRepository(BaseRepository[Usuario]):

    def get_by_email(self, email: str) -> Optional[Usuario]:
        """Busca usuario por email (incluye eliminados)."""
        stmt = select(Usuario).where(Usuario.email == email)
        return self.session.exec(stmt).first()

    def get_active_by_email(self, email: str) -> Optional[Usuario]:
        """Busca usuario por email, excluyendo eliminados."""
        stmt = select(Usuario).where(
            Usuario.email == email,
            Usuario.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()


class UsuarioRolRepository(BaseRepository[UsuarioRol]):
    pass