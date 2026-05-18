"""Service de Categorías — Lógica de negocio."""
from app.core.uow import UnitOfWork
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaTreeNode
from app.models.all_models import Categoria


class CategoriaService:

    @staticmethod
    def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
        existing = uow.categorias.get_by_nombre(data.nombre)
        if existing:
            raise ValueError("Ya existe una categoría con ese nombre")

        if data.padre_id == 0:
            raise ValueError("padre_id no puede ser 0")

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
    def get_tree(uow: UnitOfWork) -> list[CategoriaTreeNode]:
        """Retorna la jerarquía completa de categorías como árbol anidado.

        Usa todas las categorías activas y construye el árbol en memoria,
        agrupando por padre_id.
        """
        all_categories = uow.categorias.get_all_active()

        # Construir diccionario de hijos por padre_id
        children_map: dict[int | None, list[Categoria]] = {}
        for cat in all_categories:
            parent_key = cat.padre_id
            if parent_key not in children_map:
                children_map[parent_key] = []
            children_map[parent_key].append(cat)

        # Función recursiva para construir nodos del árbol
        def build_node(cat: Categoria) -> CategoriaTreeNode:
            subcats = children_map.get(cat.id, [])
            return CategoriaTreeNode(
                id=cat.id,
                nombre=cat.nombre,
                descripcion=cat.descripcion,
                padre_id=cat.padre_id,
                subcategorias=[build_node(child) for child in subcats],
            )

        # Raíces = categorías sin padre (padre_id is None)
        roots = children_map.get(None, [])
        return [build_node(root) for root in roots]

    @staticmethod
    def get_subcategorias(uow: UnitOfWork, padre_id: int) -> list[Categoria]:
        return uow.categorias.get_subcategorias(padre_id)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: CategoriaUpdate) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or categoria.eliminado_en is not None:
            raise ValueError("Categoría no encontrada")

        if data.nombre is not None:
            # Validar nombre único (excepto sí misma)
            existing = uow.categorias.get_by_nombre(data.nombre)
            if existing and existing.id != id:
                raise ValueError("Ya existe una categoría con ese nombre")
            categoria.nombre = data.nombre
        if data.descripcion is not None:
            categoria.descripcion = data.descripcion

        # Validar ciclo en padre_id si se está cambiando
        if data.padre_id is not None:
            # Una categoría no puede ser hija de sí misma
            if data.padre_id == id:
                raise ValueError("Se generaría un ciclo en la jerarquía")
            # Validar que el nuevo padre no sea descendiente de esta categoría
            if uow.categorias.is_descendant(data.padre_id, id):
                raise ValueError("Se generaría un ciclo en la jerarquía")
            categoria.padre_id = data.padre_id

        return uow.categorias.update(categoria)

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None:
            raise ValueError("Categoría no encontrada")

        # Validar que no tenga subcategorías activas
        active_subcats = uow.categorias.count_active_subcategorias(id)
        if active_subcats > 0:
            raise ValueError(
                "No se puede eliminar una categoría con subcategorías activas. "
                "Reasigne o elimine las subcategorías primero."
            )

        return uow.categorias.delete(id)