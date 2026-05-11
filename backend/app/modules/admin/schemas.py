"""Schemas de Admin — Dashboard."""
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_usuarios: int
    total_pedidos: int
    total_productos: int
    productos_disponibles: int
    pedidos_pendientes: int
    pedidos_entregados: int