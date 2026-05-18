"""Seed de productos — limpia todo y deja solo Pizza y Mani con alergenos correctos.

Ejecutar con: python -m app.db.seed_products
"""
from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Session, select

from app.core.database import engine
from app.models.all_models import (
    Producto, Categoria, Ingrediente,
    ProductoCategoria, ProductoIngrediente,
)


# Catalogo final: cada ingrediente con su flag de alergeno y removible
# - es_alergeno: si contiene/es un alergeno comun (gluten, lacteos, frutos secos, etc.)
# - es_removible: si el cliente puede pedir que se lo saquen del producto

PRODUCTOS_SEED = [
    {
        "nombre": "Pizza",
        "descripcion": "Pizza clasica con salsa de tomate, mozzarella fresca y albahaca. Horneada a la piedra.",
        "precio_base": Decimal("1500.00"),
        "stock_cantidad": 50,
        "disponible": True,
        "imagen": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80",
        "categoria": "Comidas",
        "ingredientes": [
            # (nombre, es_alergeno, es_removible)
            ("Harina de trigo", True,  False),   # gluten — base, no removible
            ("Salsa de tomate", False, False),   # base, no removible
            ("Mozzarella",      True,  True),    # lacteo — se puede pedir sin
            ("Albahaca",        False, True),    # opcional, removible
            ("Aceite de oliva", False, False),   # base, no removible
        ],
    },
    {
        "nombre": "Mani",
        "descripcion": "Mani tostado sin sal, snack natural y crocante. Ideal para picar.",
        "precio_base": Decimal("500.00"),
        "stock_cantidad": 100,
        "disponible": True,
        "imagen": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=400&fit=crop&q=80",
        "categoria": "Snacks",
        "ingredientes": [
            ("Mani", True, False),  # frutos secos — alergeno fuerte, no removible (es el producto)
        ],
    },
]


def _get_or_restore_categoria(session: Session, nombre: str) -> Categoria:
    """Obtiene categoria por nombre. Si esta soft-deleteada, la restaura."""
    cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
    if cat is None:
        cat = Categoria(nombre=nombre)
        session.add(cat)
        session.flush()
        print(f"[CAT] Creada: {nombre}")
        return cat
    if cat.eliminado_en is not None:
        cat.eliminado_en = None
        session.add(cat)
        session.flush()
        print(f"[CAT] Restaurada: {nombre}")
    return cat


def _get_or_restore_ingrediente(session: Session, nombre: str, es_alergeno: bool) -> Ingrediente:
    """Obtiene ingrediente por nombre. Si esta soft-deleteado, lo restaura.

    Actualiza es_alergeno si cambia (la columna es la fuente de verdad para el front).
    """
    ing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
    if ing is None:
        ing = Ingrediente(nombre=nombre, es_alergeno=es_alergeno)
        session.add(ing)
        session.flush()
        print(f"[ING] Creado: {nombre} (alergeno={es_alergeno})")
        return ing

    changed = False
    if ing.eliminado_en is not None:
        ing.eliminado_en = None
        changed = True
    if ing.es_alergeno != es_alergeno:
        ing.es_alergeno = es_alergeno
        changed = True
    if changed:
        session.add(ing)
        session.flush()
        print(f"[ING] Actualizado: {nombre} (alergeno={es_alergeno})")
    return ing


def seed():
    nombres_esperados = {p["nombre"] for p in PRODUCTOS_SEED}

    with Session(engine) as session:
        # ── 1. Soft-delete productos que NO esten en el seed esperado ──
        productos_activos = session.exec(
            select(Producto).where(Producto.eliminado_en.is_(None))
        ).all()

        soft_deleted = 0
        for p in productos_activos:
            if p.nombre in nombres_esperados:
                continue
            # Borrar asociaciones M2M con SQL directo
            from sqlalchemy import delete as sa_delete
            session.execute(sa_delete(ProductoCategoria).where(ProductoCategoria.producto_id == p.id))
            session.execute(sa_delete(ProductoIngrediente).where(ProductoIngrediente.producto_id == p.id))
            p.eliminado_en = datetime.now(timezone.utc)
            session.add(p)
            soft_deleted += 1

        if soft_deleted:
            session.commit()
            print(f"[CLEAN] Soft-deleted {soft_deleted} productos viejos")

        # ── 2. Para cada producto del seed: crear o sincronizar ──
        for prod_data in PRODUCTOS_SEED:
            cat = _get_or_restore_categoria(session, prod_data["categoria"])
            ingredientes_objs = [
                (_get_or_restore_ingrediente(session, ing_nombre, es_alergeno), es_removible)
                for (ing_nombre, es_alergeno, es_removible) in prod_data["ingredientes"]
            ]

            # Buscar producto activo con ese nombre (independiente de soft-delete)
            producto = session.exec(
                select(Producto).where(Producto.nombre == prod_data["nombre"])
            ).first()

            if producto is None:
                producto = Producto(
                    nombre=prod_data["nombre"],
                    descripcion=prod_data["descripcion"],
                    precio_base=prod_data["precio_base"],
                    stock_cantidad=prod_data["stock_cantidad"],
                    disponible=prod_data["disponible"],
                    imagen=prod_data["imagen"],
                )
                session.add(producto)
                session.flush()
                print(f"[PROD] Creado: {prod_data['nombre']}")
            else:
                producto.descripcion = prod_data["descripcion"]
                producto.precio_base = prod_data["precio_base"]
                producto.stock_cantidad = prod_data["stock_cantidad"]
                producto.disponible = prod_data["disponible"]
                producto.imagen = prod_data["imagen"]
                producto.eliminado_en = None
                session.add(producto)
                session.flush()
                print(f"[PROD] Actualizado: {prod_data['nombre']}")

            # Reemplazar asociaciones M2M (idempotente)
            from sqlalchemy import delete as sa_delete
            session.execute(sa_delete(ProductoCategoria).where(ProductoCategoria.producto_id == producto.id))
            session.execute(sa_delete(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto.id))
            session.flush()

            session.add(ProductoCategoria(
                producto_id=producto.id,
                categoria_id=cat.id,
                es_principal=True,
            ))
            for ing, es_removible in ingredientes_objs:
                session.add(ProductoIngrediente(
                    producto_id=producto.id,
                    ingrediente_id=ing.id,
                    es_removible=es_removible,
                ))

            session.commit()

        print("[OK] Seed de productos completado.")


if __name__ == "__main__":
    seed()
