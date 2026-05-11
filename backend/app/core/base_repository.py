"""BaseRepository[T] — Repositorio genérico con operaciones CRUD.

Provee create(), get_by_id(), get_all(), update(), delete() (soft)
y hard_delete() para todas las entidades del sistema.

El filtrado de soft delete (eliminado_en IS NULL) es automático
en get_all() solo para modelos que tienen ese campo.
"""
from datetime import datetime, timezone
from typing import Generic, Type, TypeVar, Optional

from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Repositorio genérico con CRUD común para todas las entidades.

    Uso:
        repo = BaseRepository[Usuario](Usuario, session)
        user = repo.get_by_id(1)
        all_users = repo.get_all()
    """

    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    # ── Create ────────────────────────────────────────────────────────
    def create(self, entity: T) -> T:
        """Crea y persiste una nueva entidad. Flush sin commit."""
        self.session.add(entity)
        self.session.flush()
        return entity

    # ── Read ──────────────────────────────────────────────────────────
    def get_by_id(self, id: int) -> Optional[T]:
        """Busca entidad por PK. Retorna None si no existe."""
        return self.session.get(self.model, id)

    def get_all(self, offset: int = 0, limit: int = 100) -> list[T]:
        """Retorna todas las entidades con paginación.

        Filtra eliminado_en IS NULL automáticamente si el modelo
        tiene ese campo (soft delete).
        """
        stmt = select(self.model)

        # Filtrar soft delete solo si el modelo tiene el campo
        if hasattr(self.model, "eliminado_en"):
            stmt = stmt.where(self.model.eliminado_en.is_(None))  # type: ignore[attr-defined]

        stmt = stmt.offset(offset).limit(limit)
        return list(self.session.exec(stmt).all())

    # ── Update ───────────────────────────────────────────────────────
    def update(self, entity: T) -> T:
        """Actualiza una entidad existente. Flush sin commit."""
        self.session.add(entity)
        self.session.flush()
        return entity

    # ── Delete ────────────────────────────────────────────────────────
    def delete(self, id: int) -> bool:
        """Soft delete: establece eliminado_en al timestamp actual.

        Retorna True si la entidad fue encontrada, False si no.
        Solo aplica a modelos con campo eliminado_en.
        """
        entity = self.get_by_id(id)
        if entity is None:
            return False

        if hasattr(entity, "eliminado_en"):
            entity.eliminado_en = datetime.now(timezone.utc)  # type: ignore[attr-defined]
            self.session.add(entity)
            self.session.flush()
            return True

        # Modelo sin soft delete → hard delete
        self.session.delete(entity)
        self.session.flush()
        return True

    def hard_delete(self, id: int) -> bool:
        """Eliminación física de la base de datos.

        ⚠️ Usar con precaución. Solo para casos excepcionales.
        Retorna True si la entidad fue encontrada, False si no.
        """
        entity = self.get_by_id(id)
        if entity is None:
            return False
        self.session.delete(entity)
        self.session.flush()
        return True