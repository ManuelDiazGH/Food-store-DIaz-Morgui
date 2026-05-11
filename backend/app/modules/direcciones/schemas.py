"""Schemas de Direcciones — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DireccionCreate(BaseModel):
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str = Field(max_length=255)
    linea2: Optional[str] = Field(default=None, max_length=255)
    ciudad: str = Field(max_length=100)
    cp: str = Field(max_length=20)
    es_principal: bool = False


class DireccionUpdate(BaseModel):
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: Optional[str] = Field(default=None, max_length=255)
    linea2: Optional[str] = Field(default=None, max_length=255)
    ciudad: Optional[str] = Field(default=None, max_length=100)
    cp: Optional[str] = Field(default=None, max_length=20)


class DireccionRead(BaseModel):
    id: int
    alias: Optional[str] = None
    linea1: str
    linea2: Optional[str] = None
    ciudad: str
    cp: str
    es_principal: bool
    usuario_id: int
    eliminado_en: Optional[datetime] = None

    model_config = {"from_attributes": True}