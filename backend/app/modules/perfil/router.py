"""Router de Perfil — Endpoints para gestión de datos del cliente.

Rutas:
- GET  /api/v1/perfil          — Ver perfil propio
- PUT  /api/v1/perfil          — Editar nombre y teléfono
- PUT  /api/v1/perfil/password — Cambiar contraseña
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.core.uow import UnitOfWork
from app.modules.perfil.schemas import PerfilRead, PerfilUpdate, PasswordChange
from app.modules.perfil.service import PerfilService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/perfil", tags=["Perfil"])


@router.get("", response_model=PerfilRead)
def get_perfil(current_user: Annotated[Usuario, Depends(get_current_user)]):
    """Ver perfil del usuario autenticado. Extrae user_id del JWT."""
    with UnitOfWork() as uow:
        try:
            usuario = PerfilService.get_perfil(uow, current_user.id)
            return PerfilRead(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email,
                telefono=usuario.telefono,
                fecha_registro=usuario.created_at,
            )
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("", response_model=PerfilRead)
def update_perfil(
    body: PerfilUpdate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Editar nombre y teléfono del perfil. Email NO es modificable."""
    with UnitOfWork() as uow:
        try:
            usuario = PerfilService.update_perfil(uow, current_user.id, body)
            uow.commit()
            return PerfilRead(
                id=usuario.id,
                nombre=usuario.nombre,
                email=usuario.email,
                telefono=usuario.telefono,
                fecha_registro=usuario.created_at,
            )
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/password", status_code=status.HTTP_200_OK)
def change_password(
    body: PasswordChange,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Cambiar contraseña. Invalida todos los refresh tokens (forzar re-login)."""
    with UnitOfWork() as uow:
        try:
            PerfilService.change_password(uow, current_user.id, body)
            uow.commit()
            return {"message": "Contraseña actualizada correctamente. Iniciá sesión nuevamente."}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))