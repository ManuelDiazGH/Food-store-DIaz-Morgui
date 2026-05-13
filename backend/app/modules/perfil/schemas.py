"""Schemas de Perfil — Pydantic v2."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.core.validators import validate_phone


class PerfilRead(BaseModel):
    """Datos del perfil del usuario autenticado."""
    id: int
    nombre: str
    email: str
    telefono: Optional[str] = None
    fecha_registro: datetime

    model_config = {"from_attributes": True}


class PerfilUpdate(BaseModel):
    """Actualización de datos del perfil. El email NO es modificable."""
    nombre: str = Field(min_length=2, max_length=100)
    telefono: Optional[str] = Field(default=None, max_length=20)

    @field_validator('telefono')
    @classmethod
    def validate_phone_format(cls, v: Optional[str]) -> Optional[str]:
        return validate_phone(v)


class PasswordChange(BaseModel):
    """Cambio de contraseña — requiere contraseña actual."""
    password_actual: str = Field(min_length=8)
    password_nueva: str = Field(min_length=8)