"""Router de Categorías — Endpoints CRUD jerárquicos."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate, CategoriaUpdate, CategoriaRead, CategoriaTreeNode,
)
from app.modules.categorias.service import CategoriaService

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorías"])


@router.get("/tree", response_model=list[CategoriaTreeNode])
def get_categoria_tree():
    """Retorna la jerarquía completa de categorías como árbol anidado.

    Endpoint público — no requiere autenticación.
    Solo incluye categorías activas (eliminado_en IS NULL).
    """
    with UnitOfWork() as uow:
        return CategoriaService.get_tree(uow)


@router.get("", response_model=list[CategoriaRead])
def list_categorias(offset: int = Query(default=0, ge=0), limit: int = Query(default=100, ge=1, le=100)):
    with UnitOfWork() as uow:
        return CategoriaService.get_all(uow, offset=offset, limit=limit)


@router.get("/{id}", response_model=CategoriaRead)
def get_categoria(id: int):
    with UnitOfWork() as uow:
        try:
            return CategoriaService.get_by_id(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{id}/subcategorias", response_model=list[CategoriaRead])
def get_subcategorias(id: int):
    with UnitOfWork() as uow:
        return CategoriaService.get_subcategorias(uow, id)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def create_categoria(body: CategoriaCreate):
    with UnitOfWork() as uow:
        try:
            categoria = CategoriaService.create(uow, body)
            uow.commit()
            return categoria
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead, dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def update_categoria(id: int, body: CategoriaUpdate):
    with UnitOfWork() as uow:
        try:
            categoria = CategoriaService.update(uow, id, body)
            uow.commit()
            return categoria
        except ValueError as e:
            if "ciclo" in str(e):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def delete_categoria(id: int):
    with UnitOfWork() as uow:
        try:
            deleted = CategoriaService.delete(uow, id)
            if not deleted:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
            uow.commit()
        except ValueError as e:
            if "subcategorías" in str(e):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))