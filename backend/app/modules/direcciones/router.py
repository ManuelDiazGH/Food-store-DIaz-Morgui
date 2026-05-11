"""Router de Direcciones — Endpoints CRUD + dirección principal."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user
from app.modules.direcciones.schemas import DireccionCreate, DireccionUpdate, DireccionRead
from app.modules.direcciones.service import DireccionService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/direcciones", tags=["Direcciones"])


@router.get("/usuario/{usuario_id}", response_model=list[DireccionRead])
def get_direcciones_by_usuario(usuario_id: int):
    with UnitOfWork() as uow:
        return DireccionService.get_by_usuario(uow, usuario_id)


@router.get("/{id}", response_model=DireccionRead)
def get_direccion(id: int):
    with UnitOfWork() as uow:
        try:
            return DireccionService.get_by_id(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=DireccionRead, status_code=status.HTTP_201_CREATED)
def create_direccion(
    body: DireccionCreate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    with UnitOfWork() as uow:
        direccion = DireccionService.create(uow, current_user.id, body)
        uow.commit()
        return direccion


@router.put("/{id}", response_model=DireccionRead)
def update_direccion(
    id: int,
    body: DireccionUpdate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    with UnitOfWork() as uow:
        try:
            direccion = DireccionService.update(uow, id, body)
            uow.commit()
            return direccion
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/principal", response_model=DireccionRead)
def set_principal(id: int, current_user: Annotated[Usuario, Depends(get_current_user)]):
    """Establece esta dirección como la principal del usuario."""
    with UnitOfWork() as uow:
        try:
            direccion = DireccionService.set_principal(uow, id)
            uow.commit()
            return direccion
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direccion(id: int, current_user: Annotated[Usuario, Depends(get_current_user)]):
    with UnitOfWork() as uow:
        deleted = DireccionService.delete(uow, id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dirección no encontrada")
        uow.commit()