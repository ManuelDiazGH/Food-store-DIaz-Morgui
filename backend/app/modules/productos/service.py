"""Service de Productos — Lógica de negocio.

Sprint 3: Agrega catálogo público con filtros, asociaciones M2M,
gestión de stock atómica, y soporte para soft delete.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import select

from app.core.uow import UnitOfWork
from app.modules.productos.schemas import (
    ProductoCatalogoRead,
    ProductoCategoriasUpdate,
    ProductoCreate,
    ProductoDetalleRead,
    ProductoIngredienteItem,
    ProductoIngredientesUpdate,
    ProductoIngredienteRead,
    ProductoCategoriaRead,
    ProductoListResponse,
    ProductoUpdate,
    StockUpdate,
)
from app.models.all_models import Producto, ProductoCategoria, ProductoIngrediente, Categoria, Ingrediente


class ProductoService:

    # ── CRUD básico (existente, mejorado) ──────────────────────────────

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

        # Validación: precio > 0 con máximo 2 decimales
        if data.precio_base is not None:
            if data.precio_base <= 0:
                raise ValueError("El precio debe ser mayor a 0")
            # Verificar máximo 2 decimales
            if data.precio_base != round(data.precio_base, 2):
                raise ValueError("El precio debe tener máximo 2 decimales")

        # Validación: stock no negativo
        if data.stock_cantidad is not None and data.stock_cantidad < 0:
            raise ValueError("El stock no puede ser negativo")

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
        """Soft delete — marca eliminado_en en vez de borrar físicamente."""
        producto = uow.productos.get_by_id(id)
        if producto is None:
            return False
        if producto.eliminado_en is not None:
            raise ValueError("Producto ya eliminado")
        return uow.productos.delete(id)  # BaseRepository ya hace soft delete

    # ── Sprint 3: Catálogo público con filtros ──────────────────────

    @staticmethod
    def get_catalog(
        uow: UnitOfWork,
        categoria_id: Optional[int] = None,
        busqueda: Optional[str] = None,
        excluir_alergenos: Optional[list[int]] = None,
        page: int = 1,
        limit: int = 20,
        incluir_eliminados: bool = False,
    ) -> ProductoListResponse:
        """Retorna catálogo público con filtros y paginación."""
        offset = (page - 1) * limit
        productos, total = uow.productos.get_catalog(
            offset=offset,
            limit=limit,
            categoria_id=categoria_id,
            busqueda=busqueda,
            excluir_alergenos=excluir_alergenos,
            incluir_eliminados=incluir_eliminados,
        )

        items = []
        for p in productos:
            # Obtener nombres de categorías
            cat_repo = uow.productos  # Usar el mismo repo
            cat_ids = uow.productos.get_categoria_ids(p.id)
            categoria_nombres = []
            for cid in cat_ids:
                cat = uow.session.get(Categoria, cid)
                if cat and cat.eliminado_en is None:
                    categoria_nombres.append(cat.nombre)

            items.append(ProductoCatalogoRead(
                id=p.id,
                nombre=p.nombre,
                precio_base=p.precio_base,
                imagen=p.imagen,
                disponible=p.disponible,
                categorias=categoria_nombres,
            ))

        return ProductoListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
        )

    @staticmethod
    def get_detalle(uow: UnitOfWork, producto_id: int) -> ProductoDetalleRead:
        """Retorna detalle completo de un producto con categorías e ingredientes."""
        producto = uow.productos.get_by_id_with_relations(producto_id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")

        # Mapear categorías
        categorias = []
        for pc in producto.categorias:
            cat = uow.session.get(Categoria, pc.categoria_id)
            if cat:
                categorias.append(ProductoCategoriaRead(
                    id=cat.id,
                    nombre=cat.nombre,
                    es_principal=pc.es_principal,
                ))

        # Mapear ingredientes
        ingredientes = []
        for pi in producto.ingredientes:
            ingr = uow.session.get(Ingrediente, pi.ingrediente_id)
            if ingr:
                ingredientes.append(ProductoIngredienteRead(
                    id=ingr.id,
                    nombre=ingr.nombre,
                    es_alergeno=ingr.es_alergeno,
                    es_removible=pi.es_removible,
                ))

        return ProductoDetalleRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagen=producto.imagen,
            disponible=producto.disponible,
            hay_stock=producto.stock_cantidad > 0,
            categorias=categorias,
            ingredientes=ingredientes,
        )

    # ── Sprint 3: Asociaciones M2M ──────────────────────────────────

    @staticmethod
    def associate_categorias(uow: UnitOfWork, producto_id: int, data: ProductoCategoriasUpdate) -> ProductoDetalleRead:
        """Asocia categorías a un producto (reemplazo completo)."""
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")

        # Validar que todas las categorías existen y no están eliminadas
        for cat_id in data.categoria_ids:
            cat = uow.session.get(Categoria, cat_id)
            if cat is None or cat.eliminado_en is not None:
                raise ValueError(f"Categoría no encontrada: {cat_id}")

        uow.productos.replace_categorias(producto_id, data.categoria_ids)
        uow.session.flush()

        # Forzar recarga de relaciones
        uow.session.refresh(producto)
        return ProductoService.get_detalle(uow, producto_id)

    @staticmethod
    def associate_ingredientes(
        uow: UnitOfWork,
        producto_id: int,
        data: ProductoIngredientesUpdate,
    ) -> ProductoDetalleRead:
        """Asocia ingredientes a un producto (reemplazo completo)."""
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")

        # Validar que todos los ingredientes existen y no están eliminados
        ingredientes_data = []
        for item in data.ingredientes:
            ingr = uow.session.get(Ingrediente, item.ingrediente_id)
            if ingr is None or ingr.eliminado_en is not None:
                raise ValueError(f"Ingrediente no encontrado: {item.ingrediente_id}")
            ingredientes_data.append((item.ingrediente_id, item.es_removible))

        uow.productos.replace_ingredientes(producto_id, ingredientes_data)
        uow.session.flush()

        # Forzar recarga de relaciones
        uow.session.refresh(producto)
        return ProductoService.get_detalle(uow, producto_id)

    # ── Sprint 3: Stock atómico ─────────────────────────────────────

    @staticmethod
    def update_stock(uow: UnitOfWork, producto_id: int, data: StockUpdate) -> Producto:
        """Actualiza stock de forma atómica (incremento o absoluto)."""
        producto = uow.productos.update_stock_atomic(
            producto_id=producto_id,
            cantidad=data.cantidad,
            tipo=data.tipo,
        )
        return producto