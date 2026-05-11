"""Food Store — FastAPI Application Factory.

Configura:
- CORS (orígenes desde variable de entorno)
- Rate limiting con slowapi
- Registro de routers de módulos con prefijo ``/api/v1``
- Manejador de errores RFC 7807
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings

# ── Import routers ────────────────────────────────────────────────
from app.modules.admin.router import router as admin_router
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.direcciones.router import router as direcciones_router
from app.modules.ingredientes.router import router as ingredientes_router
from app.modules.pagos.router import router as pagos_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.refreshtokens.router import (
    router as refreshtokens_router,
)
from app.modules.usuarios.router import router as usuarios_router

# ── Rate limiter ───────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejador de ciclo de vida de la aplicación."""
    # Startup: acciones necesarias antes de recibir requests
    yield
    # Shutdown: limpieza de recursos


def create_app() -> FastAPI:
    """Factory de la aplicación FastAPI."""
    app = FastAPI(
        title="Food Store",
        description="API de e-commerce de productos alimenticios",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        swagger_ui_parameters={"tryItOutEnabled": True},
    )

    # ── CORS ────────────────────────────────────────────────────────
    origins = [
        o.strip()
        for o in settings.CORS_ORIGINS.split(",")
        if o.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limiting ──────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(
        RateLimitExceeded, _rate_limit_exceeded_handler
    )

    # ── Registro de routers ────────────────────────────────────────
    app.include_router(auth_router)
    app.include_router(usuarios_router)
    app.include_router(categorias_router)
    app.include_router(productos_router)
    app.include_router(ingredientes_router)
    app.include_router(pedidos_router)
    app.include_router(pagos_router)
    app.include_router(direcciones_router)
    app.include_router(admin_router)
    app.include_router(refreshtokens_router)

    # ── RFC 7807 error handler global ──────────────────────────────
    @app.exception_handler(Exception)
    async def rfc7807_handler(request: Request, exc: Exception):
        """Middleware de errores global con formato RFC 7807."""
        status_code = getattr(exc, "status_code", 500)
        detail = str(exc) if str(exc) else "Internal Server Error"
        return JSONResponse(
            status_code=status_code,
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": status_code,
                "detail": detail,
                "instance": str(request.url),
            },
        )

    # ── Health check ──────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    return app


app = create_app()
