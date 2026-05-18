"""Seed de productos — limpia todo y deja solo Pizza y Maní.

Ejecutar con: python -m app.db.seed_products
"""
from datetime import datetime, timezone
from decimal import Decimal

from sqlmodel import Session, select, delete

from app.core.database import engine
from app.models.all_models import (
    Producto, Categoria, Ingrediente,
    ProductoCategoria, ProductoIngrediente,
)


PRODUCTOS_SEED = [
    {
        "nombre": "Pizza",
        "descripcion": "Pizza clasica con salsa de tomate, mozzarella fresca y albahaca. Horneada a la piedra.",
        "precio_base": Decimal("1500.00"),
        "stock_cantidad": 50,
        "disponible": True,
        "imagen": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80",
        "categoria": "Comidas",
        "ingredientes": ["Mozzarella", "Salsa de tomate", "Albahaca", "Harina", "Aceite de oliva"],
    },
    {
        "nombre": "Mani",
        "descripcion": "Mani tostado sin sal, snack natural y crocante. Ideal para picar.",
        "precio_base": Decimal("500.00"),
        "stock_cantidad": 100,
        "disponible": True,
        "imagen": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=400&fit=crop&q=80",
        "categoria": "Snacks",
        "ingredientes": ["Mani"],
    },
]


def seed():
    with Session(engine) as session:
        # ── 1. Soft-delete all existing products and their M2M associations ──
        productos_activos = session.exec(
            select(Producto).where(Producto.eliminado_en.is_(None))
        ).all()

        for p in productos_activos:
            # Delete M2M associations first (ProductoCategoria, ProductoIngrediente)
            session.exec(
                delete(ProductoCategoria).where(ProductoCategoria.producto_id == p.id)
            )
            session.exec(
                delete(ProductoIngrediente).where(ProductoIngrediente.producto_id == p.id)
            )
            # Soft-delete the product
            p.eliminado_en = datetime.now(timezone.utc)
            session.add(p)

        if productos_activos:
            session.commit()
            print(f"[CLEAN] Soft-deleted {len(productos_activos)} existing products")

        # ── 2. Ensure categories and ingredients exist, then create products ──
        for prod_data in PRODUCTOS_SEED:
            # Check if product already exists (by name)
            existing = session.exec(
                select(Producto).where(
                    Producto.nombre == prod_data["nombre"],
                    Producto.eliminado_en.is_(None),
                )
            ).first()

            if existing:
                print(f"[SKIP] Producto ya existe: {prod_data['nombre']}")
                continue

            # Get or create category
            cat = session.exec(
                select(Categoria).where(
                    Categoria.nombre == prod_data["categoria"],
                    Categoria.eliminado_en.is_(None),
                )
            ).first()
            if not cat:
                cat = Categoria(nombre=prod_data["categoria"])
                session.add(cat)
                session.flush()
                print(f"[CAT] Categoria creada: {prod_data['categoria']}")

            # Get or create ingredients
            ingrediente_objs = []
            for ing_nombre in prod_data["ingredientes"]:
                ing = session.exec(
                    select(Ingrediente).where(
                        Ingrediente.nombre == ing_nombre,
                        Ingrediente.eliminado_en.is_(None),
                    )
                ).first()
                if not ing:
                    ing = Ingrediente(nombre=ing_nombre, es_alergeno=False)
                    session.add(ing)
                    session.flush()
                ingrediente_objs.append(ing)

            # Create product
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

            # Assign category as principal
            session.add(ProductoCategoria(
                producto_id=producto.id,
                categoria_id=cat.id,
                es_principal=True,
            ))

            # Assign ingredients
            for ing in ingrediente_objs:
                session.add(ProductoIngrediente(
                    producto_id=producto.id,
                    ingrediente_id=ing.id,
                    es_removible=(ing.nombre != "Mani"),  # Mani is not removable
                ))

            session.commit()
            print(f"[OK] Producto creado: {prod_data['nombre']} (${prod_data['precio_base']})")

        print("[OK] Seed de productos completado.")


if __name__ == "__main__":
    seed()
