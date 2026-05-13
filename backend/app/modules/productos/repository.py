"""Repositorio de productos — Hereda de BaseRepository[Producto].

Incluye consultas con filtros para catálogo público y gestión de stock atómica.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, text
from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.models.all_models import Producto, ProductoCategoria, ProductoIngrediente


class ProductoRepository(BaseRepository[Producto]):

    def get_by_nombre(self, nombre: str) -> Optional[Producto]:
        """Busca producto por nombre (excluye eliminados)."""
        stmt = select(Producto).where(
            Producto.nombre == nombre,
            Producto.eliminado_en.is_(None),
        )
        return self.session.exec(stmt).first()

    def get_disponibles(self, offset: int = 0, limit: int = 100) -> list[Producto]:
        """Retorna productos disponibles y no eliminados."""
        stmt = (
            select(Producto)
            .where(
                Producto.disponible == True,  # noqa: E712
                Producto.eliminado_en.is_(None),
            )
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    # ── Sprint 3: Catálogo con filtros y relaciones ────────────────

    def get_by_id_with_relations(self, id: int) -> Optional[Producto]:
        """Busca producto por ID y fuerza carga de relaciones (categorías, ingredientes)."""
        producto = self.session.get(Producto, id)
        if producto is None:
            return None
        # Forzar carga eager de relaciones
        _ = producto.categorias
        _ = producto.ingredientes
        return producto

    def get_catalog(
        self,
        offset: int = 0,
        limit: int = 20,
        categoria_id: Optional[int] = None,
        busqueda: Optional[str] = None,
        excluir_alergenos: Optional[list[int]] = None,
        incluir_eliminados: bool = False,
    ) -> tuple[list[Producto], int]:
        """Retorna productos del catálogo con filtros y paginación.

        Returns:
            (productos, total) — lista paginada y conteo total.
        """
        # Base query — solo disponibles y no eliminados (por defecto)
        stmt = select(Producto)
        count_stmt = select(func.count()).select_from(Producto)

        if not incluir_eliminados:
            stmt = stmt.where(Producto.eliminado_en.is_(None))
            count_stmt = count_stmt.where(Producto.eliminado_en.is_(None))

        # Filtro: solo disponibles (catálogo público)
        if not incluir_eliminados:
            stmt = stmt.where(Producto.disponible == True)  # noqa: E712
            count_stmt = count_stmt.where(Producto.disponible == True)  # noqa: E712

        # Filtro por categoría
        if categoria_id is not None:
            cat_subquery = (
                select(ProductoCategoria.producto_id)
                .where(ProductoCategoria.categoria_id == categoria_id)
            )
            stmt = stmt.where(Producto.id.in_(cat_subquery))
            count_stmt = count_stmt.where(Producto.id.in_(cat_subquery))

        # Filtro por búsqueda de nombre (ILIKE)
        if busqueda:
            stmt = stmt.where(Producto.nombre.ilike(f"%{busqueda}%"))
            count_stmt = count_stmt.where(Producto.nombre.ilike(f"%{busqueda}%"))

        # Filtro excluir alérgenos (NOT EXISTS)
        if excluir_alergenos:
            alergenos_subquery = (
                select(ProductoIngrediente.producto_id)
                .where(
                    ProductoIngrediente.ingrediente_id.in_(excluir_alergenos)
                )
            )
            stmt = stmt.where(~Producto.id.in_(alergenos_subquery))
            count_stmt = count_stmt.where(~Producto.id.in_(alergenos_subquery))

        # Contar total
        total = self.session.exec(count_stmt).one()

        # Paginación
        stmt = stmt.offset(offset).limit(limit)
        productos = list(self.session.exec(stmt).all())

        return productos, total

    # ── Sprint 3: Gestión de asociaciones M2M ──────────────────────

    def get_categoria_ids(self, producto_id: int) -> list[int]:
        """Retorna IDs de categorías asociadas a un producto."""
        stmt = (
            select(ProductoCategoria.categoria_id)
            .where(ProductoCategoria.producto_id == producto_id)
        )
        return list(self.session.exec(stmt).all())

    def get_ingrediente_ids(self, producto_id: int) -> list[int]:
        """Retorna IDs de ingredientes asociados a un producto."""
        stmt = (
            select(ProductoIngrediente.ingrediente_id)
            .where(ProductoIngrediente.producto_id == producto_id)
        )
        return list(self.session.exec(stmt).all())

    def replace_categorias(self, producto_id: int, categoria_ids: list[int]) -> None:
        """Reemplaza todas las asociaciones de categorías de un producto."""
        # Eliminar existentes
        self.session.exec(
            text("DELETE FROM productocategoria WHERE producto_id = :pid"),
            params={"pid": producto_id},
        )
        # Crear nuevas
        for cat_id in categoria_ids:
            self.session.add(ProductoCategoria(producto_id=producto_id, categoria_id=cat_id))
        self.session.flush()

    def replace_ingredientes(self, producto_id: int, ingredientes_data: list[tuple[int, bool]]) -> None:
        """Reemplaza todas las asociaciones de ingredientes de un producto.

        ingredientes_data: lista de (ingrediente_id, es_removible)
        """
        # Eliminar existentes
        self.session.exec(
            text("DELETE FROM productoingrediente WHERE producto_id = :pid"),
            params={"pid": producto_id},
        )
        # Crear nuevas
        for ingr_id, es_removible in ingredientes_data:
            self.session.add(
                ProductoIngrediente(producto_id=producto_id, ingrediente_id=ingr_id, es_removible=es_removible)
            )
        self.session.flush()

    # ── Sprint 3: Stock atómico ─────────────────────────────────────

    def update_stock_atomic(self, producto_id: int, cantidad: int, tipo: str) -> Producto:
        """Actualiza stock atómicamente. Incremento o seteo absoluto.

        Args:
            producto_id: ID del producto
            cantidad: Cantidad a incrementar o setear
            tipo: "incremento" o "absoluto"

        Returns:
            Producto actualizado

        Raises:
            ValueError: Si el stock resultante sería negativo
        """
        producto = self.session.get(Producto, producto_id)
        if producto is None or producto.eliminado_en is not None:
            raise ValueError("Producto no encontrado")

        if tipo == "incremento":
            nuevo_stock = producto.stock_cantidad + cantidad
            if nuevo_stock < 0:
                raise ValueError("Stock insuficiente")
            producto.stock_cantidad = nuevo_stock
        else:  # absoluto
            if cantidad < 0:
                raise ValueError("El stock no puede ser negativo")
            producto.stock_cantidad = cantidad

        self.session.add(producto)
        self.session.flush()
        return producto