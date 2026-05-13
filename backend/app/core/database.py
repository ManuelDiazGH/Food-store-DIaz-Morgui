"""Configuración de SQLAlchemy engine y sesiones.

Provee:
- ``engine`` – instancia singleton de SQLAlchemy Engine
- ``get_session()`` – generador asíncrono para inyección en FastAPI
"""
from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=10,
    connect_args={"client_encoding": "utf8"},
)


def get_session() -> Generator[Session, None, None]:
    """Generador de sesión SQLModel (compatible con FastAPI Depends).

    La sesión se mantiene abierta durante toda la request, incluyendo
    la serialización de la respuesta. Se hace commit automático al
    finalizar, o rollback si hay error.
    """
    session = Session(engine, expire_on_commit=False)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Generator[Session, None, None]:
    """Generador de sesión SQLModel (compatible con FastAPI Depends)."""
    with Session(engine) as session:
        yield session
