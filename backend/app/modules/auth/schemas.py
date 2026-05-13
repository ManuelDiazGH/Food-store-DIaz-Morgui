"""Schemas de autenticación — Pydantic v2 models.

Provee schemas para registro, login, refresh y respuesta de tokens.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.validators import validate_phone


class RegisterRequest(BaseModel):
    """Request body para registro de nuevo cliente."""
    nombre: str = Field(min_length=2, max_length=100, description="Nombre completo")
    email: EmailStr = Field(description="Email válido RFC 5322")
    password: str = Field(min_length=8, max_length=128, description="Contraseña mínimo 8 caracteres")
    telefono: Optional[str] = Field(default=None, max_length=20, description="Teléfono opcional")

    @field_validator('telefono')
    @classmethod
    def validate_phone_format(cls, v: Optional[str]) -> Optional[str]:
        return validate_phone(v)


class LoginRequest(BaseModel):
    """Request body para login."""
    email: EmailStr = Field(description="Email del usuario")
    password: str = Field(min_length=1, description="Contraseña")


class RefreshRequest(BaseModel):
    """Request body para renovar tokens."""
    refresh_token: str = Field(description="Refresh token UUID v4")


# ── Response schemas ───────────────────────────────────────────────

class TokenResponse(BaseModel):
    """Respuesta con par de tokens JWT + refresh."""
    access_token: str = Field(description="JWT access token")
    refresh_token: str = Field(description="Refresh token UUID v4")
    token_type: str = Field(default="bearer", description="Tipo de token")
    expires_in: int = Field(description="Tiempo de expiración del access token en segundos")


class UserResponse(BaseModel):
    """Respuesta con datos del usuario autenticado."""
    id: int
    email: str
    nombre: str
    telefono: Optional[str] = None
    roles: list[str] = Field(default_factory=list, description="Lista de códigos de rol")
    created_at: datetime

    model_config = {"from_attributes": True}


class RefreshTokenResponse(BaseModel):
    """Respuesta con nuevo par de tokens tras refresh."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int