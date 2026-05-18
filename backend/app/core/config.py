"""Configuración centralizada vía Pydantic Settings.

Carga variables de entorno desde .env con valores por defecto.
Valida tipos y provee un singleton ``settings`` para todo el backend.
"""
import os
import secrets

from pydantic_settings import BaseSettings


# Sentinelas inseguras que NUNCA deben aparecer en producción.
_INSECURE_SECRET_KEY = "DEV_ONLY_CHANGE_ME"  # noqa: S105
_INSECURE_ADMIN_PASSWORD = "admin123"  # noqa: S105


class Settings(BaseSettings):
    """Configuración de la aplicación."""

    # ── Entorno ────────────────────────────────────────────────────
    ENV: str = "development"  # "development" | "production"

    # ── Base de datos ──────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql://user:password@localhost:5432/foodstore"
    )

    # ── JWT / Auth ─────────────────────────────────────────────────
    # En dev queda un random per-process si no se setea; en producción se
    # fuerza a venir por env (ver _enforce_production_safety).
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    # ── Frontend / Backend URLs ─────────────────────────────────────
    # Usada por MP para back_urls y notification_url. Si está vacía cae al
    # primer origen de CORS_ORIGINS (compatibilidad).
    FRONTEND_URL: str = ""

    # ── MercadoPago ────────────────────────────────────────────────
    MP_ACCESS_TOKEN: str = ""
    MP_PUBLIC_KEY: str = ""
    MP_WEBHOOK_BASE_URL: str = "http://localhost:8000"
    # Secret para validar firma HMAC del webhook (Mercado Pago → Webhooks).
    # Si está vacío y ENV=production se rechaza el arranque.
    MP_WEBHOOK_SECRET: str = ""

    # ── Seed ───────────────────────────────────────────────────────
    ADMIN_EMAIL: str = "admin@foodstore.com"
    ADMIN_PASSWORD: str = _INSECURE_ADMIN_PASSWORD

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def is_production(self) -> bool:
        return self.ENV.lower() == "production"


def _enforce_production_safety(s: Settings) -> None:
    """Falla rápido si quedan defaults inseguros en producción."""
    if not s.is_production():
        return

    problems: list[str] = []
    if not s.SECRET_KEY or s.SECRET_KEY == _INSECURE_SECRET_KEY:
        problems.append("SECRET_KEY")
    if s.ADMIN_PASSWORD == _INSECURE_ADMIN_PASSWORD:
        problems.append("ADMIN_PASSWORD")
    if not s.MP_WEBHOOK_SECRET:
        problems.append("MP_WEBHOOK_SECRET")
    if s.MP_ACCESS_TOKEN.startswith("TEST-") or not s.MP_ACCESS_TOKEN:
        problems.append("MP_ACCESS_TOKEN (vacío o de sandbox)")

    if problems:
        raise RuntimeError(
            "ENV=production pero hay configuración insegura: "
            + ", ".join(problems)
            + ". Setealas vía .env antes de arrancar."
        )


settings = Settings()

# En desarrollo, si SECRET_KEY no fue seteado, generar uno random per-process
# para que la app arranque pero los tokens NO sobrevivan a un restart.
if not settings.SECRET_KEY:
    if settings.is_production():
        raise RuntimeError("SECRET_KEY es obligatoria cuando ENV=production")
    settings.SECRET_KEY = secrets.token_urlsafe(64)
    if os.environ.get("FOODSTORE_QUIET") != "1":
        print("[WARN] SECRET_KEY no configurada — usando una random per-process (dev)")

_enforce_production_safety(settings)
