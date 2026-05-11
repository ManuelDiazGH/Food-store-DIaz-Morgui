"""Schemas de Productos — Pydantic v2."""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


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