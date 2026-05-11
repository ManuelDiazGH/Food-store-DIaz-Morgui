"""Schemas de Categorías — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    padre_id: Optional[int] = None


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)


class CategoriaRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    padre_id: Optional[int] = None
    created_at: datetime
    eliminado_en: Optional[datetime] = None

    model_config = {"from_attributes": True}