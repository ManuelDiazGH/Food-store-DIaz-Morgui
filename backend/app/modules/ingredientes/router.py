"""Router de Ingredientes — Endpoints CRUD + alérgenos."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.modules.ingredientes.service import IngredienteService

router = APIRouter(prefix="/api/v1/ingredientes", tags=["Ingredientes"])


@router.get("", response_model=list[IngredienteRead])
def list_ingredientes(
    alergeno: Optional[bool] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
):
    """Lista ingredientes. Filtra por alérgenos si se pasa ?alergeno=true."""
    with UnitOfWork() as uow:
        if alergeno is True:
            return IngredienteService.get_alergenos(uow, offset=offset, limit=limit)
        return IngredienteService.get_all(uow, offset=offset, limit=limit)


@router.get("/{id}", response_model=IngredienteRead)
def get_ingrediente(id: int):
    with UnitOfWork() as uow:
        try:
            return IngredienteService.get_by_id(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN"))])
def create_ingrediente(body: IngredienteCreate):
    with UnitOfWork() as uow:
        try:
            ingrediente = IngredienteService.create(uow, body)
            uow.commit()
            return ingrediente
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=IngredienteRead, dependencies=[Depends(require_role("ADMIN"))])
def update_ingrediente(id: int, body: IngredienteUpdate):
    with UnitOfWork() as uow:
        try:
            ingrediente = IngredienteService.update(uow, id, body)
            uow.commit()
            return ingrediente
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("ADMIN"))])
def delete_ingrediente(id: int):
    with UnitOfWork() as uow:
        deleted = IngredienteService.delete(uow, id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ingrediente no encontrado")
        uow.commit()