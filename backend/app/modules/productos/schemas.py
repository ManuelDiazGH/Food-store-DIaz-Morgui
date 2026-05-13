"""Schemas de Productos — Pydantic v2."""
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ── Schemas existentes (Sprint 0-2) ────────────────────────────────

class ProductoCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=200)
    descripcion: Optional[str] = Field(default=None, max_length=2000)
    precio_base: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stock_cantidad: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    imagen: Optional[str] = Field(default=None, max_length=500)


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=200)
    descripcion: Optional[str] = Field(default=None, max_length=2000)
    precio_base: Optional[Decimal] = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    stock_cantidad: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    imagen: Optional[str] = Field(default=None, max_length=500)


class ProductoRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    stock_cantidad: int
    disponible: bool
    imagen: Optional[str] = None
    created_at: datetime
    eliminado_en: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Schemas Sprint 3 — Relaciones M2M ─────────────────────────────

class ProductoCategoriaRead(BaseModel):
    """Categoría asociada a un producto (vista desde el producto)."""
    id: int
    nombre: str
    es_principal: bool = False

    model_config = {"from_attributes": True}


class ProductoIngredienteRead(BaseModel):
    """Ingrediente asociado a un producto (con flag de alérgeno y removible)."""
    id: int
    nombre: str
    es_alergeno: bool = False
    es_removible: bool = True

    model_config = {"from_attributes": True}


# ── Schemas Sprint 3 — Catálogo público ─────────────────────────────

class ProductoCatalogoRead(BaseModel):
    """Respuesta para listado público del catálogo.
    No expone stock_cantidad (solo disponible booleano)."""
    id: int
    nombre: str
    precio_base: Decimal
    imagen: Optional[str] = None
    disponible: bool
    categorias: list[str] = []

    model_config = {"from_attributes": True}


class ProductoDetalleRead(BaseModel):
    """Respuesta para detalle de producto.
    Incluye relaciones con categorías e ingredientes.
    hay_stock es booleano (no revela cantidad exacta)."""
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    imagen: Optional[str] = None
    disponible: bool
    hay_stock: bool
    categorias: list[ProductoCategoriaRead] = []
    ingredientes: list[ProductoIngredienteRead] = []

    model_config = {"from_attributes": True}


# ── Schemas Sprint 3 — Asociaciones M2M ─────────────────────────────

class ProductoCategoriasUpdate(BaseModel):
    """Body para PUT /productos/:id/categorias — reemplazo completo."""
    categoria_ids: list[int]


class ProductoIngredienteItem(BaseModel):
    """Un ingrediente asociado a un producto."""
    ingrediente_id: int
    es_removible: bool = True


class ProductoIngredientesUpdate(BaseModel):
    """Body para PUT /productos/:id/ingredientes — reemplazo completo."""
    ingredientes: list[ProductoIngredienteItem]


# ── Schemas Sprint 3 — Stock ───────────────────────────────────────

class StockUpdate(BaseModel):
    """Body para PATCH /productos/:id/stock."""
    cantidad: int = Field(ge=0)
    tipo: Literal["incremento", "absoluto"]


# ── Schemas Sprint 3 — Respuesta paginada ──────────────────────────

class ProductoListResponse(BaseModel):
    """Respuesta paginada para listado de productos."""
    items: list[ProductoCatalogoRead]
    total: int
    page: int
    limit: int