"""Repositorio de RefreshTokens — Hereda de BaseRepository[RefreshToken].

Incluye métodos específicos para invalidación segura en logout.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import RefreshToken


class RefreshTokenRepository(BaseRepository[RefreshToken]):

    def get_by_token_hash(self, token_hash: str) -> Optional[RefreshToken]:
        """Busca token por hash. Returns None si no existe o fue revocado."""
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        return self.session.exec(stmt).first()

    def revoke_token(self, token_hash: str) -> bool:
        """Revoca un refresh token estableciendo revoked_at.

        Retorna True si el token fue encontrado y revocado.
        """
        token = self.get_by_token_hash(token_hash)
        if token is None:
            return False
        token.revoked_at = datetime.now(timezone.utc)
        self.session.add(token)
        self.session.flush()
        return True

    def revoke_all_for_user(self, usuario_id: int) -> int:
        """Revoca TODOS los refresh tokens activos de un usuario.

        Retorna la cantidad de tokens revocados.
        """
        stmt = select(RefreshToken).where(
            RefreshToken.usuario_id == usuario_id,
            RefreshToken.revoked_at.is_(None),
        )
        tokens = self.session.exec(stmt).all()
        now = datetime.now(timezone.utc)
        for token in tokens:
            token.revoked_at = now
            self.session.add(token)
        self.session.flush()
        return len(tokens)