"""Auth Router — Endpoints de autenticación.

Rutas:
- POST /api/v1/auth/register
- POST /api/v1/auth/login         (rate limited: 5/15min/IP)
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET  /api/v1/auth/me
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.uow import UnitOfWork
from app.core.dependencies import get_current_user, require_role
from app.modules.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    RefreshTokenResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.modules.auth.service import AuthService
from app.models.all_models import Usuario

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

limiter = Limiter(key_func=get_remote_address)


# ── POST /auth/register ────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    """Registra un nuevo cliente.

    Asigna automáticamente el rol CLIENT (RN-AU07).
    Hashea la contraseña con bcrypt (RN-AU01).
    Retorna par de tokens al registrarse exitosamente.
    """
    with UnitOfWork() as uow:
        try:
            usuario = AuthService.register(
                uow,
                nombre=body.nombre,
                email=body.email,
                password=body.password,
                telefono=body.telefono,
            )
            # Generar tokens para el nuevo usuario
            result = AuthService.login(uow, body.email, body.password)
            return TokenResponse(**result)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e),
            )


# ── POST /auth/login ───────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/15minutes")
def login(request: Request, body: LoginRequest):
    """Autentica un usuario y retorna par de tokens.

    Rate limited: 5 intentos por IP en 15 minutos (RN-AU06).
    No diferencia email inexistente de contraseña incorrecta (RN-AU08).
    """
    with UnitOfWork() as uow:
        try:
            result = AuthService.login(uow, body.email, body.password)
            return TokenResponse(**result)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )


# ── POST /auth/refresh ─────────────────────────────────────────────

@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh(body: RefreshRequest):
    """Renueva tokens usando un refresh token válido.

    Aplica rotación de tokens (RN-AU04).
    Detecta replay attacks y revoca todos los tokens del usuario (RN-AU05).
    """
    with UnitOfWork() as uow:
        try:
            result = AuthService.refresh(uow, body.refresh_token)
            return RefreshTokenResponse(**result)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
            )


# ── POST /auth/logout ──────────────────────────────────────────────

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    body: RefreshRequest,
    current_user: Annotated[Usuario, Depends(get_current_user)],
):
    """Revoca el refresh token del usuario autenticado."""
    with UnitOfWork() as uow:
        AuthService.logout(uow, body.refresh_token)


# ── GET /auth/me ───────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def me(current_user: Annotated[Usuario, Depends(get_current_user)]):
    """Retorna los datos del usuario autenticado."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        nombre=current_user.nombre,
        telefono=current_user.telefono,
        roles=[ur.rol_codigo for ur in current_user.roles],
        created_at=current_user.created_at,
    )