"""Schemas de Ingredientes — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IngredienteCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    es_alergeno: bool = False


class IngredienteUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    es_alergeno: Optional[bool] = None


class IngredienteRead(BaseModel):
    id: int
    nombre: str
    es_alergeno: bool
    eliminado_en: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}