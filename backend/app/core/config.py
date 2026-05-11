"""Configuración centralizada vía Pydantic Settings.

Carga variables de entorno desde .env con valores por defecto.
Valida tipos y provee un singleton ``settings`` para todo el backend.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación."""

    # ── Base de datos ──────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql://user:password@localhost:5432/foodstore"
    )

    # ── JWT / Auth ─────────────────────────────────────────────────
    SECRET_KEY: str = (
        "cambiar-en-produccion-clave-de-64-caracteres-minimo"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    # ── MercadoPago ────────────────────────────────────────────────
    MP_ACCESS_TOKEN: str = ""
    MP_PUBLIC_KEY: str = ""

    # ── Seed ───────────────────────────────────────────────────────
    ADMIN_EMAIL: str = "admin@foodstore.com"
    ADMIN_PASSWORD: str = "admin123"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
