"""Repositorio de auth — Consultas de autenticación."""
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Usuario, RefreshToken


class AuthRepository(BaseRepository[Usuario]):
    """Repositorio para operaciones de autenticación.

    Hereda de BaseRepository[Usuario] y agrega métodos
    específicos de login y verificación.
    """

    def get_active_by_email(self, email: str) -> Optional[Usuario]:
        """Busca usuario activo por email para login."""
        stmt = select(Usuario).where(
            Usuario.email == email,
            Usuario.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()