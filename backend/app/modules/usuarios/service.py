"""Service de Usuarios — Lógica de negocio CRUD."""
from app.core.uow import UnitOfWork
from app.core.security import hash_password
from app.modules.usuarios.schemas import UsuarioCreate, UsuarioUpdate, UsuarioRead, UsuarioRolCreate
from app.models.all_models import Usuario, UsuarioRol


class UsuarioService:
    """Servicio de usuarios — stateless, recibe UoW por inyección."""

    @staticmethod
    def create(uow: UnitOfWork, data: UsuarioCreate) -> Usuario:
        """Crea un nuevo usuario (sin asignar rol — eso va por assign_role)."""
        existing = uow.auth.get_active_by_email(data.email)
        if existing is not None:
            raise ValueError("El email ya está registrado")

        usuario = Usuario(
            email=data.email,
            password_hash=hash_password(data.password),
            nombre=data.nombre,
            telefono=data.telefono,
        )
        return uow.usuarios.create(usuario)

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> Usuario:
        """Obtiene un usuario por ID."""
        usuario = uow.usuarios.get_by_id(id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")
        return usuario

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Usuario]:
        """Obtiene todos los usuarios activos (soft delete filtrado)."""
        return uow.usuarios.get_all(offset=offset, limit=limit)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: UsuarioUpdate) -> Usuario:
        """Actualiza datos de un usuario."""
        usuario = uow.usuarios.get_by_id(id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")

        if data.nombre is not None:
            usuario.nombre = data.nombre
        if data.email is not None:
            existing = uow.usuarios.get_by_email(data.email)
            if existing is not None and existing.id != id:
                raise ValueError("El email ya está registrado")
            usuario.email = data.email
        if data.telefono is not None:
            usuario.telefono = data.telefono

        return uow.usuarios.update(usuario)

    @staticmethod
    def toggle_activo(uow: UnitOfWork, usuario_id: int, activo: bool) -> Usuario:
        """Activa o desactiva un usuario. Si se desactiva, invalida sus refresh tokens."""
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")

        usuario.activo = activo
        result = uow.usuarios.update(usuario)

        if not activo:
            from app.models.all_models import RefreshToken
            uow.refreshtokens.revoke_all_for_user(usuario_id)

        return result

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        """Soft delete de un usuario."""
        return uow.usuarios.delete(id)

    @staticmethod
    def assign_role(uow: UnitOfWork, usuario_id: int, rol_codigo: str) -> UsuarioRol:
        """Asigna un rol a un usuario."""
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise ValueError("Usuario no encontrado")

        # Verificar si ya tiene el rol
        for ur in usuario.roles:
            if ur.rol_codigo == rol_codigo:
                raise ValueError(f"El usuario ya tiene el rol {rol_codigo}")

        usuario_rol = UsuarioRol(
            usuario_id=usuario_id,
            rol_codigo=rol_codigo,
        )
        return uow.usuario_roles.create(usuario_rol)