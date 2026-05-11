"""Repositorio de admin — Dashboard y queries de métricas."""
from app.core.base_repository import BaseRepository
from app.models.all_models import Pedido


class AdminRepository(BaseRepository[Pedido]):
    """Repositorio para queries de dashboard administrativo.

    Hereda de BaseRepository[Pedido] ya que la mayoría
    de las métricas son sobre pedidos.
    """
    pass