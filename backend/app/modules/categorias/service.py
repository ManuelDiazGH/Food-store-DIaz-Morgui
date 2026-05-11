"""Service de Categorías — Lógica de negocio."""
from app.core.uow import UnitOfWork
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate
from app.models.all_models import Categoria


class CategoriaService:

    @staticmethod
    def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
        existing = uow.categorias.get_by_nombre(data.nombre)
        if existing:
            raise ValueError("Ya existe una categoría con ese nombre")

        categoria = Categoria(
            nombre=data.nombre,
            descripcion=data.descripcion,
            padre_id=data.padre_id,
        )
        return uow.categorias.create(categoria)

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or categoria.eliminado_en is not None:
            raise ValueError("Categoría no encontrada")
        return categoria

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Categoria]:
        return uow.categorias.get_all(offset=offset, limit=limit)

    @staticmethod
    def get_subcategorias(uow: UnitOfWork, padre_id: int) -> list[Categoria]:
        return uow.categorias.get_subcategorias(padre_id)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: CategoriaUpdate) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or categoria.eliminado_en is not None:
            raise ValueError("Categoría no encontrada")

        if data.nombre is not None:
            categoria.nombre = data.nombre
        if data.descripcion is not None:
            categoria.descripcion = data.descripcion

        return uow.categorias.update(categoria)

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        # Validar que no tenga productos activos asociados
        categoria = uow.categorias.get_by_id(id)
        if categoria is None:
            raise ValueError("Categoría no encontrada")
        if hasattr(categoria, 'productos') and categoria.productos:
            raise ValueError("No se puede eliminar una categoría con productos activos")
        return uow.categorias.delete(id)