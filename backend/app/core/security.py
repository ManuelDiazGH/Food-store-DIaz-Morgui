"""Utilidades de seguridad: hashing, JWT y dependencias FastAPI.

Provee:
- ``hash_password()`` / ``verify_password()`` con bcrypt (cost ≥ 12)
- ``create_access_token()`` con JWT HS256
- ``create_refresh_token()`` que genera UUID v4
- ``decode_token()`` para validación interna
"""
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password hashing ───────────────────────────────────────────────
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
BCRYPT_ROUNDS = 12


def hash_password(password: str) -> str:
    """Retorna el hash bcrypt de *password* (cost = 12)."""
    return _pwd.hash(password, rounds=BCRYPT_ROUNDS)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara *plain_password* contra su hash."""
    return _pwd.verify(plain_password, hashed_password)


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
