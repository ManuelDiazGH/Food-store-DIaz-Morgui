"""Router de Productos — Endpoints CRUD + catálogo + M2M + stock.

Sprint 3: Agrega endpoints de catálogo público con filtros,
asociaciones M2M (categorías, ingredientes), gestión de stock atómica,
y soft delete.
"""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.productos.schemas import (
    ProductoCatalogoRead,
    ProductoCategoriasUpdate,
    ProductoCreate,
    ProductoDetalleRead,
    ProductoIngredientesUpdate,
    ProductoListResponse,
    ProductoRead,
    ProductoUpdate,
    StockUpdate,
)
from app.modules.productos.service import ProductoService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])


# ── GET /productos — Catálogo público con filtros ──────────────────

@router.get("", response_model=ProductoListResponse)
def list_productos(
    categoria: Optional[int] = Query(default=None, alias="categoria", description="Filtrar por categoría ID"),
    busqueda: Optional[str] = Query(default=None, description="Buscar por nombre (ILIKE)"),
    excluir_alergenos: Optional[str] = Query(default=None, description="IDs de alérgenos a excluir, separados por coma"),
    page: int = Query(default=1, ge=1, description="Número de página"),
    limit: int = Query(default=20, ge=1, le=100, description="Items por página"),
    incluir_eliminados: bool = Query(default=False, description="Incluir productos eliminados (solo ADMIN/STOCK)"),
    current_user: Optional[Annotated[Usuario, Depends(get_current_user)]] = None,
):
    """Lista productos del catálogo con filtros y paginación.

    Público: solo productos disponibles y no eliminados.
    ADMIN/STOCK con ?incluir_eliminados=true: ve todos.
    """
    # Parsear alérgenos
    alergenos_list = None
    if excluir_alergenos:
        try:
            alergenos_list = [int(x.strip()) for x in excluir_alergenos.split(",") if x.strip()]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Los IDs de alérgenos deben ser números separados por coma",
            )

    # Solo ADMIN/STOCK pueden ver eliminados
    if incluir_eliminados:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Se requiere autenticación para ver productos eliminados",
            )
        user_roles = [ur.rol_codigo for ur in current_user.roles]
        if not any(r in user_roles for r in ("ADMIN", "STOCK")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo ADMIN o STOCK pueden ver productos eliminados",
            )

    with UnitOfWork() as uow:
        return ProductoService.get_catalog(
            uow,
            categoria_id=categoria,
            busqueda=busqueda,
            excluir_alergenos=alergenos_list,
            page=page,
            limit=limit,
            incluir_eliminados=incluir_eliminados,
        )


# ── GET /productos/:id — Detalle con relaciones ────────────────────

@router.get("/{id}", response_model=ProductoDetalleRead)
def get_producto(id: int):
    """Detalle de producto con categorías, ingredientes y alérgenos."""
    with UnitOfWork() as uow:
        try:
            return ProductoService.get_detalle(uow, id)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── POST /productos — Crear producto ───────────────────────────────

@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED,
              dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def create_producto(body: ProductoCreate):
    with UnitOfWork() as uow:
        producto = ProductoService.create(uow, body)
        uow.commit()
        return producto


# ── PUT /productos/:id — Editar producto ────────────────────────────

@router.put("/{id}", response_model=ProductoRead, dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def update_producto(id: int, body: ProductoUpdate):
    with UnitOfWork() as uow:
        try:
            producto = ProductoService.update(uow, id, body)
            uow.commit()
            return producto
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── PUT /productos/:id/categorias — Asociar categorías M2M ────────

@router.put("/{id}/categorias", response_model=ProductoDetalleRead,
             dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def associate_categorias(id: int, body: ProductoCategoriasUpdate):
    """Asocia categorías a un producto (reemplazo completo de la lista)."""
    with UnitOfWork() as uow:
        try:
            result = ProductoService.associate_categorias(uow, id, body)
            uow.commit()
            return result
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── PUT /productos/:id/ingredientes — Asociar ingredientes M2M ────

@router.put("/{id}/ingredientes", response_model=ProductoDetalleRead,
              dependencies=[Depends(require_role("ADMIN", "STOCK"))])
def associate_ingredientes(id: int, body: ProductoIngredientesUpdate):
    """Asocia ingredientes a un producto (reemplazo completo de la lista)."""
    with UnitOfWork() as uow:
        try:
            result = ProductoService.associate_ingredientes(uow, id, body)
            uow.commit()
            return result
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── PATCH /productos/:id/disponibilidad — Toggle disponibilidad ────

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


# ── PATCH /productos/:id/stock — Gestión de stock atómica ─────────

@router.patch("/{id}/stock", response_model=ProductoRead,
               dependencies=[Depends(require_role("STOCK", "ADMIN"))])
def update_stock(id: int, body: StockUpdate):
    """Actualización atómica de stock. Incremento o seteo absoluto."""
    with UnitOfWork() as uow:
        try:
            producto = ProductoService.update_stock(uow, id, body)
            uow.commit()
            return producto
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── DELETE /productos/:id — Soft delete ────────────────────────────

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[Depends(require_role("ADMIN"))])
def delete_producto(id: int):
    """Soft delete — marca eliminado_en. Solo rol ADMIN."""
    with UnitOfWork() as uow:
        try:
            deleted = ProductoService.delete(uow, id)
            if not deleted:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            uow.commit()
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))