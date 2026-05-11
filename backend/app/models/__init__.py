"""Modelos SQLModel para Food Store.

Importa todos los modelos para que SQLModel los registre
y Alembic los detecte en autogenerate.
"""
from app.models.all_models import *  # noqa: F401, F403, E402
