"""Service de RefreshTokens — Manejado por auth module."""
from app.core.uow import UnitOfWork


class RefreshTokenService:
    """Servicio mínimo — la lógica principal está en AuthService."""

    @staticmethod
    def revoke_all_for_user(uow: UnitOfWork, usuario_id: int) -> int:
        """Revoca todos los refresh tokens de un usuario."""
        return uow.refreshtokens.revoke_all_for_user(usuario_id)