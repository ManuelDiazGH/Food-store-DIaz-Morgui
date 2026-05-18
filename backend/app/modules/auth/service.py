"""Auth Service — Lógica de negocio para autenticación.

Operaciones: register, login, refresh, logout, me.
Todas las operaciones son stateless y reciben UnitOfWork por inyección.
"""
import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.core.config import settings
from app.core.security import ALGORITHM, create_access_token, create_refresh_token, hash_password, verify_password
from app.models.all_models import RefreshToken, Usuario, UsuarioRol


class AuthService:
    """Servicio de autenticación — stateless, recibe UoW por inyección."""

    # ── Registro ────────────────────────────────────────────────────

    @staticmethod
    def register(uow, nombre: str, email: str, password: str, telefono: str | None = None) -> Usuario:
        """Registra un nuevo cliente. Asigna rol CLIENT automáticamente.

        Rule RN-AU07: El rol CLIENT se asigna en la capa de servicio.
        Rule RN-AU01: La contraseña se hashea con bcrypt (cost ≥ 12).
        Rule RN-DA04: Email UNIQUE con índice.

        Raises:
            ValueError: Si el email ya está registrado.
        """
        existing = uow.auth.get_active_by_email(email)
        if existing is not None:
            raise ValueError("El email ya está registrado")

        # Crear usuario
        usuario = Usuario(
            email=email,
            password_hash=hash_password(password),
            nombre=nombre,
            telefono=telefono,
        )
        uow.usuarios.create(usuario)
        uow.session.flush()

        # Asignar rol CLIENT automáticamente (RN-AU07)
        usuario_rol = UsuarioRol(
            usuario_id=usuario.id,
            rol_codigo="CLIENT",
        )
        uow.usuario_roles.create(usuario_rol)

        return usuario

    # ── Login ───────────────────────────────────────────────────────

    @staticmethod
    def login(uow, email: str, password: str) -> dict:
        """Autentica un usuario y retorna par de tokens.

        Rule RN-AU08: No diferenciar "email no existe" de "contraseña incorrecta".
        Rule RN-AU02: JWT con 30 min de expiración.
        Rule RN-AU03: Refresh token UUID v4 opaco almacenado en BD.

        Returns:
            Dict con access_token, refresh_token, token_type, expires_in.

        Raises:
            ValueError: Si las credenciales son inválidas.
        """
        usuario = uow.auth.get_active_by_email(email)

        # RN-AU08: No diferenciar email inexistente / contraseña incorrecta /
        # cuenta desactivada. Cualquiera de los tres devuelve el mismo error
        # para no permitir enumerar cuentas válidas.
        credenciales_ok = (
            usuario is not None
            and verify_password(password, usuario.password_hash)
            and usuario.activo
        )
        if not credenciales_ok:
            raise ValueError("Credenciales inválidas")
        assert usuario is not None  # type narrowing

        # Generar access token
        roles = [ur.rol_codigo for ur in usuario.roles]
        access_token = create_access_token({
            "sub": str(usuario.id),
            "email": usuario.email,
            "roles": roles,
        })

        # Generar refresh token
        refresh_token_raw, refresh_token_hash = AuthService._create_refresh_token(
            uow, usuario.id
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token_raw,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    # ── Refresh Token ────────────────────────────────────────────────

    @staticmethod
    def refresh(uow, refresh_token_raw: str) -> dict:
        """Renueva tokens usando un refresh token válido.

        Rule RN-AU04: Rotación — el token anterior se revoca y se emite uno nuevo.
        Rule RN-AU05: Si se detecta reuso de token revocado, se revocan TODOS los tokens del usuario.

        Raises:
            ValueError: Si el refresh token es inválido, expirado o ya fue usado.
        """
        token_hash = hashlib.sha256(refresh_token_raw.encode()).hexdigest()

        stored_token = uow.refreshtokens.get_by_token_hash(token_hash)

        if stored_token is None:
            raise ValueError("Refresh token inválido")

        # Verificar expiración
        if stored_token.expires_at < datetime.now(timezone.utc):
            raise ValueError("Refresh token expirado")

        # Verificar si ya fue revocado (replay attack — RN-AU05)
        if stored_token.revoked_at is not None:
            # Replay attack detectado: revocar TODOS los tokens del usuario
            uow.refreshtokens.revoke_all_for_user(stored_token.usuario_id)
            raise ValueError("Refresh token reutilizado — todos los tokens revocados por seguridad")

        # Rotación (RN-AU04): revocar el token actual
        uow.refreshtokens.revoke_token(token_hash)

        # Emitir nuevo par de tokens
        usuario = uow.usuarios.get_by_id(stored_token.usuario_id)
        if usuario is None or usuario.eliminado_en is not None:
            raise ValueError("Usuario no encontrado")

        roles = [ur.rol_codigo for ur in usuario.roles]
        access_token = create_access_token({
            "sub": str(usuario.id),
            "email": usuario.email,
            "roles": roles,
        })

        new_refresh_raw, new_refresh_hash = AuthService._create_refresh_token(
            uow, usuario.id
        )

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_raw,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    # ── Logout ──────────────────────────────────────────────────────

    @staticmethod
    def logout(uow, refresh_token_raw: str) -> bool:
        """Revoca un refresh token específico.

        Returns:
            True si el token fue revocado, False si no se encontró.
        """
        token_hash = hashlib.sha256(refresh_token_raw.encode()).hexdigest()
        return uow.refreshtokens.revoke_token(token_hash)

    # ── Get Current User ────────────────────────────────────────────

    @staticmethod
    def get_current_user(uow, user_id: int) -> Usuario:
        """Obtiene el usuario autenticado por ID.

        Raises:
            ValueError: Si el usuario no existe o está eliminado.
        """
        usuario = uow.usuarios.get_by_id(user_id)
        if usuario is None:
            raise ValueError("Usuario no encontrado")
        if usuario.eliminado_en is not None:
            raise ValueError("Usuario eliminado")
        return usuario

    # ── Helpers privados ────────────────────────────────────────────

    @staticmethod
    def _create_refresh_token(uow, usuario_id: int) -> tuple[str, str]:
        """Crea un refresh token UUID v4, lo hashea y lo almacena en BD.

        Returns:
            Tuple de (token_raw, token_hash) — el raw se envía al cliente.
        """
        token_raw = create_refresh_token()  # UUID v4
        token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
        family_id = str(uuid.uuid4())

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        refresh_token = RefreshToken(
            token_hash=token_hash,
            expires_at=expires_at,
            usuario_id=usuario_id,
            family_id=family_id,
        )
        uow.refreshtokens.create(refresh_token)

        return token_raw, token_hash