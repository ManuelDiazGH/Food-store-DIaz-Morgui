"""Schemas de Admin — Dashboard."""
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_usuarios: int
    total_pedidos: int
    total_productos: int
    productos_disponibles: int
    pedidos_pendientes: int
    pedidos_entregados: int


class VentaPorPeriodo(BaseModel):
    periodo: str
    monto: float
    cantidad: int


class TopProducto(BaseModel):
    nombre: str
    cantidad_vendida: int
    ingreso_total: float


class PedidoPorEstado(BaseModel):
    estado: str
    cantidad: int


class MetricasCompletas(BaseModel):
    total_usuarios: int
    total_pedidos: int
    total_productos: int
    total_ventas: float
    ventas_por_periodo: list[VentaPorPeriodo] = []
    top_productos: list[TopProducto] = []
    pedidos_por_estado: list[PedidoPorEstado] = []