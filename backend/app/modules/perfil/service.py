"""Service de Perfil — Lógica de negocio.

Gestiona ver y editar perfil del cliente y cambio de contraseña.
No usa repositorio propio — opera sobre Usuario a través del UoW.
"""
from datetime import datetime, timezone

from app.core.security import hash_password, verify_password
from app.core.uow import UnitOfWork
from app.modules.perfil.schemas import PasswordChange, PerfilUpdate
from app.models.all_models import Usuario


class PerfilService:

    @staticmethod
    def get_perfil(uow: UnitOfWork, user_id: int) -> Usuario:
        """Retorna el perfil del usuario autenticado."""
        usuario = uow.usuarios.get_by_id(user_id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")
        return usuario

    @staticmethod
    def update_perfil(uow: UnitOfWork, user_id: int, data: PerfilUpdate) -> Usuario:
        """Actualiza nombre y teléfono del usuario. Email NO es modificable."""
        usuario = uow.usuarios.get_by_id(user_id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")

        usuario.nombre = data.nombre
        if data.telefono is not None:
            usuario.telefono = data.telefono

        return uow.usuarios.update(usuario)

    @staticmethod
    def change_password(uow: UnitOfWork, user_id: int, data: PasswordChange) -> None:
        """Cambia la contraseña del usuario.

        1. Verifica contraseña actual con bcrypt
        2. Hashea la nueva contraseña
        3. Actualiza el usuario
        4. Revoca TODOS los refresh tokens del usuario (forzar re-login)
        """
        usuario = uow.usuarios.get_by_id(user_id)
        if usuario is None:
            raise ValueError("Usuario no encontrado")

        # 1. Verificar contraseña actual
        if not verify_password(data.password_actual, usuario.password_hash):
            raise ValueError("Contraseña actual incorrecta")

        # 2. Hashear nueva contraseña
        usuario.password_hash = hash_password(data.password_nueva)
        uow.usuarios.update(usuario)

        # 3. Revocar TODOS los refresh tokens del usuario (forzar re-login en todos los dispositivos)
        uow.refreshtokens.revoke_all_for_user(user_id)