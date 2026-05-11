"""Service de Productos — Lógica de negocio."""
from app.core.uow import UnitOfWork
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate
from app.models.all_models import Producto


class ProductoService:

    @staticmethod
    def create(uow: UnitOfWork, data: ProductoCreate) -> Producto:
        producto = Producto(
            nombre=data.nombre,
            descripcion=data.descripcion,
            precio_base=data.precio_base,
            stock_cantidad=data.stock_cantidad,
            disponible=data.disponible,
            imagen=data.imagen,
        )
        return uow.productos.create(producto)

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> Producto:
        producto = uow.productos.get_by_id(id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")
        return producto

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Producto]:
        return uow.productos.get_all(offset=offset, limit=limit)

    @staticmethod
    def get_disponibles(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Producto]:
        return uow.productos.get_disponibles(offset=offset, limit=limit)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: ProductoUpdate) -> Producto:
        producto = uow.productos.get_by_id(id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")

        if data.nombre is not None:
            producto.nombre = data.nombre
        if data.descripcion is not None:
            producto.descripcion = data.descripcion
        if data.precio_base is not None:
            producto.precio_base = data.precio_base
        if data.stock_cantidad is not None:
            producto.stock_cantidad = data.stock_cantidad
        if data.disponible is not None:
            producto.disponible = data.disponible
        if data.imagen is not None:
            producto.imagen = data.imagen

        return uow.productos.update(producto)

    @staticmethod
    def toggle_disponibilidad(uow: UnitOfWork, id: int, disponible: bool) -> Producto:
        """Toggle disponibilidad — restricted to STOCK role."""
        producto = uow.productos.get_by_id(id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")
        producto.disponible = disponible
        return uow.productos.update(producto)

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        return uow.productos.delete(id)