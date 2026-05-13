"""Router de Usuarios — Endpoints CRUD."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.usuarios.schemas import UsuarioCreate, UsuarioUpdate, UsuarioRead, UsuarioRolCreate
from app.modules.usuarios.service import UsuarioService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/usuarios", tags=["Usuarios"])


@router.get("", response_model=list[UsuarioRead])
def list_usuarios(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
):
    """Lista todos los usuarios activos (soft delete filtrado)."""
    with UnitOfWork() as uow:
        usuarios = UsuarioService.get_all(uow, offset=offset, limit=limit)
        return [UsuarioRead.from_usuario(u) for u in usuarios]


@router.get("/{id}", response_model=UsuarioRead)
def get_usuario(id: int):
    """Obtiene un usuario por ID."""
    with UnitOfWork() as uow:
        try:
            usuario = UsuarioService.get_by_id(uow, id)
            return UsuarioRead.from_usuario(usuario)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN"))])
def create_usuario(body: UsuarioCreate):
    """Crea un nuevo usuario. Solo ADMIN."""
    with UnitOfWork() as uow:
        try:
            usuario = UsuarioService.create(uow, body)
            uow.commit()
            return usuario
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=UsuarioRead)
def update_usuario(
    id: int,
    body: UsuarioUpdate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Actualiza datos de un usuario. ADMIN o el propio usuario."""
    if current_user.id != id and "ADMIN" not in [ur.rol_codigo for ur in current_user.roles]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")

    with UnitOfWork() as uow:
        try:
            usuario = UsuarioService.update(uow, id, body)
            uow.commit()
            return usuario
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("ADMIN"))])
def delete_usuario(id: int):
    """Soft delete de un usuario. Solo ADMIN."""
    with UnitOfWork() as uow:
        deleted = UsuarioService.delete(uow, id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        uow.commit()


@router.post("/{id}/roles", status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN"))])
def assign_role(id: int, body: UsuarioRolCreate):
    """Asigna un rol a un usuario. Solo ADMIN."""
    with UnitOfWork() as uow:
        try:
            ur = UsuarioService.assign_role(uow, id, body.rol_codigo)
            uow.commit()
            return {"usuario_id": ur.usuario_id, "rol_codigo": ur.rol_codigo}
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))