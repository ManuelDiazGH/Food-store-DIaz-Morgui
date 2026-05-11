"""Seed data inicial — idempotente (puede ejecutarse múltiples veces).

Carga:
- 4 Roles: ADMIN, STOCK, PEDIDOS, CLIENT
- 6 Estados de pedido: PENDIENTE, CONFIRMADO, EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO
- 3 Formas de pago: MERCADOPAGO, RAPIPAGO, PAGOFACIL
- 1 Usuario admin: admin@foodstore.com / admin123
"""
from sqlmodel import Session, select

from app.core.database import engine
from app.core.config import settings
from app.core.security import hash_password
from app.models.all_models import (
    Rol, EstadoPedido, FormaPago, Usuario, UsuarioRol,
)

SEED_ROLES = [
    {"codigo": "ADMIN", "nombre": "Administrador"},
    {"codigo": "STOCK", "nombre": "Gestor de Stock"},
    {"codigo": "PEDIDOS", "nombre": "Gestor de Pedidos"},
    {"codigo": "CLIENT", "nombre": "Cliente"},
]

SEED_ESTADOS = [
    {"codigo": "PENDIENTE", "nombre": "Pendiente", "orden": 1, "es_terminal": False},
    {"codigo": "CONFIRMADO", "nombre": "Confirmado", "orden": 2, "es_terminal": False},
    {"codigo": "EN_PREPARACION", "nombre": "En Preparación", "orden": 3, "es_terminal": False},
    {"codigo": "EN_CAMINO", "nombre": "En Camino", "orden": 4, "es_terminal": False},
    {"codigo": "ENTREGADO", "nombre": "Entregado", "orden": 5, "es_terminal": True},
    {"codigo": "CANCELADO", "nombre": "Cancelado", "orden": 6, "es_terminal": True},
]

SEED_FORMAS_PAGO = [
    {"codigo": "MERCADOPAGO", "nombre": "Mercado Pago", "habilitado": True},
    {"codigo": "RAPIPAGO", "nombre": "Rapipago", "habilitado": True},
    {"codigo": "PAGOFACIL", "nombre": "Pago Fácil", "habilitado": True},
]


def seed():
    with Session(engine) as session:
        # Roles (idempotent)
        for r in SEED_ROLES:
            existing = session.exec(
                select(Rol).where(Rol.codigo == r["codigo"])
            ).first()
            if not existing:
                session.add(Rol(**r))
        session.commit()

        # Estados de pedido (idempotent)
        for e in SEED_ESTADOS:
            existing = session.exec(
                select(EstadoPedido).where(EstadoPedido.codigo == e["codigo"])
            ).first()
            if not existing:
                session.add(EstadoPedido(**e))
        session.commit()

        # Formas de pago (idempotent)
        for f in SEED_FORMAS_PAGO:
            existing = session.exec(
                select(FormaPago).where(FormaPago.codigo == f["codigo"])
            ).first()
            if not existing:
                session.add(FormaPago(**f))
        session.commit()

        # Admin user (idempotent by email)
        existing_admin = session.exec(
            select(Usuario).where(Usuario.email == settings.ADMIN_EMAIL)
        ).first()
        if not existing_admin:
            admin = Usuario(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                nombre="Administrador",
            )
            session.add(admin)
            session.flush()
            # Assign ADMIN role
            session.add(UsuarioRol(usuario_id=admin.id, rol_codigo="ADMIN"))
            session.commit()
            print(f"✅ Admin creado: {settings.ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin ya existe: {settings.ADMIN_EMAIL}")

        print("✅ Seed completado — datos iniciales cargados exitosamente.")


if __name__ == "__main__":
    seed()
