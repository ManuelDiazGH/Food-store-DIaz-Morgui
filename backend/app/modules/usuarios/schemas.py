"""Schemas de Usuarios — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    """Request body para crear un usuario."""
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    telefono: Optional[str] = Field(default=None, max_length=20)


class UsuarioUpdate(BaseModel):
    """Request body para actualizar un usuario. Todos los campos opcionales."""
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    telefono: Optional[str] = Field(default=None, max_length=20)


class UsuarioRead(BaseModel):
    """Respuesta con datos del usuario."""
    id: int
    email: str
    nombre: str
    telefono: Optional[str] = None
    roles: list[str] = Field(default_factory=list)
    created_at: datetime
    eliminado_en: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UsuarioRolCreate(BaseModel):
    """Request body para asignar un rol a un usuario."""
    rol_codigo: str = Field(max_length=20)