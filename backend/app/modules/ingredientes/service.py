"""Service de Ingredientes — Lógica de negocio."""
from app.core.uow import UnitOfWork
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate
from app.models.all_models import Ingrediente


class IngredienteService:

    @staticmethod
    def create(uow: UnitOfWork, data: IngredienteCreate) -> Ingrediente:
        existing = uow.ingredientes.get_by_nombre(data.nombre)
        if existing:
            raise ValueError("Ya existe un ingrediente con ese nombre")

        ingrediente = Ingrediente(
            nombre=data.nombre,
            es_alergeno=data.es_alergeno,
        )
        return uow.ingredientes.create(ingrediente)

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> Ingrediente:
        ingrediente = uow.ingredientes.get_by_id(id)
        if ingrediente is None or ingrediente.eliminado_en is not None:
            raise ValueError("Ingrediente no encontrado")
        return ingrediente

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Ingrediente]:
        return uow.ingredientes.get_all(offset=offset, limit=limit)

    @staticmethod
    def get_alergenos(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Ingrediente]:
        return uow.ingredientes.get_alergenos(offset=offset, limit=limit)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: IngredienteUpdate) -> Ingrediente:
        ingrediente = uow.ingredientes.get_by_id(id)
        if ingrediente is None or ingrediente.eliminado_en is not None:
            raise ValueError("Ingrediente no encontrado")

        if data.nombre is not None:
            ingrediente.nombre = data.nombre
        if data.es_alergeno is not None:
            ingrediente.es_alergeno = data.es_alergeno

        return uow.ingredientes.update(ingrediente)

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        return uow.ingredientes.delete(id)