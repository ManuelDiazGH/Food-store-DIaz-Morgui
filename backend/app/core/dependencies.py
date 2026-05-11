"""Auth dependencies — FastAPI dependencies para JWT y RBAC.

Provee:
- get_current_user(): Extrae y valida JWT del header Authorization
- require_role(*roles): Factory que retorna dependencia RBAC
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import select

from app.core.security import decode_token
from app.core.uow import UnitOfWork
from app.models.all_models import Usuario

# ── Security scheme ─────────────────────────────────────────────────
_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)],
) -> Usuario:
    """Extrae y valida el JWT del header Authorization.

    Decodifica el token, extrae el user_id (sub) y carga el usuario
    con sus roles (eager loading) desde la base de datos.

    Returns:
        Usuario autenticado con relaciones cargadas.

    Raises:
        HTTPException 401: Si el token es inválido, expirado o el usuario no existe.
    """
    from jose import JWTError

    token = credentials.credentials

    try:
        payload = decode_token(token)
        user_id: int = int(payload.get("sub", 0))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    with UnitOfWork() as uow:
        # Eager load roles para evitar DetachedInstanceError fuera de la sesión
        stmt = select(Usuario).where(Usuario.id == user_id, Usuario.eliminado_en.is_(None))
        usuario = uow.session.exec(stmt).first()

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o eliminado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Forzar carga de relaciones lazy dentro de la sesión
        _ = usuario.roles  # noqa: F841
        _ = usuario.refresh_tokens  # noqa: F841

    return usuario


def require_role(*allowed_roles: str):
    """Factory que retorna una dependencia FastAPI para RBAC.

    Uso:
        @router.get("/admin", dependencies=[Depends(require_role("ADMIN"))])
        async def admin_route():
            ...

    Args:
        *allowed_roles: Roles que tienen permiso para acceder al endpoint.

    Returns:
        Dependencia FastAPI que verifica que el usuario tenga uno de los roles.
    """

    def role_checker(current_user: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
        user_roles = [ur.rol_codigo for ur in current_user.roles]
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Roles requeridos: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker