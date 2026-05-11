"""Utilidades de seguridad: hashing, JWT y dependencias FastAPI.

Provee:
- ``hash_password()`` / ``verify_password()`` con bcrypt (cost ≥ 12)
- ``create_access_token()`` con JWT HS256
- ``create_refresh_token()`` que genera UUID v4
- ``decode_token()`` para validación interna

Nota: Se usa bcrypt directamente en vez de passlib para evitar
incompatibilidades con versiones nuevas de bcrypt (≥4.1).
"""
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ── Password hashing ───────────────────────────────────────────────
BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    """Retorna el hash bcrypt de *password* (cost = 12).

    Usa bcrypt directamente para evitar problemas de compatibilidad
    con passlib y bcrypt >= 4.1.
    """
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara *plain_password* contra su hash bcrypt."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT ───────────────────────────────────────────────────────────
ALGORITHM = "HS256"


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """Crea un JWT access token HS256.

    *data* debe contener al menos ``sub`` (user id).
    Por defecto expira en ``ACCESS_TOKEN_EXPIRE_MINUTES``.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    """Genera un refresh token opaco (UUID v4).

    El token NO es un JWT; se almacena hasheado en BD.
    Retorna el UUID crudo para ser devuelto al cliente.
    """
    return str(uuid.uuid4())


def decode_token(token: str) -> dict:
    """Decodifica y valida un JWT.

    Retorna el payload si es válido.
    Lanza ``JWTError`` si expiró o la firma es inválida.
    """
    return jwt.decode(
        token, settings.SECRET_KEY, algorithms=[ALGORITHM]
    )