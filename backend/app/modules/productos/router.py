"""Router de Productos — Endpoints CRUD + disponibilidad."""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoRead
from app.modules.productos.service import ProductoService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])


@router.get("", response_model=list[ProductoRead])
def list_productos(
    disponible: Optional[bool] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
):
    """Lista productos. Filtra por disponibilidad si se pasa ?disponible=true."""
    with UnitOfWork() as uow:
        if disponible is True:
            return ProductoService.get_disponibles(uow, offset=offset, limit=limit)
        return ProductoService.get_all(uow, offset=offset, limit=limit)


@router.get("/{id}", response_model=ProductoRead)
def get_producto(id: int):
    with UnitOfWork() as uow:
        try:
            return ProductoService.get_by_id(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def create_producto(body: ProductoCreate):
    with UnitOfWork() as uow:
        producto = ProductoService.create(uow, body)
        uow.commit()
        return producto


@router.put("/{id}", response_model=ProductoRead, dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def update_producto(id: int, body: ProductoUpdate):
    with UnitOfWork() as uow:
        try:
            producto = ProductoService.update(uow, id, body)
            uow.commit()
            return producto
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/disponibilidad", response_model=ProductoRead,
              dependencies=[Depends(require_role("STOCK", "ADMIN"))])
def toggle_disponibilidad(id: int, disponible: bool):
    """Toggle disponibilidad de un producto. Solo rol STOCK o ADMIN."""
    with UnitOfWork() as uow:
        try:
            producto = ProductoService.toggle_disponibilidad(uow, id, disponible)
            uow.commit()
            return producto
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_role("ADMIN"))])
def delete_producto(id: int):
    with UnitOfWork() as uow:
        deleted = ProductoService.delete(uow, id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
        uow.commit()


