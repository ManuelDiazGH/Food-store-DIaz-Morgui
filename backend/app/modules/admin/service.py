"""Service de Admin — Dashboard y métricas."""
from sqlmodel import func, select

from app.core.uow import UnitOfWork
from app.models.all_models import Pedido, Producto, Usuario
from app.modules.admin.schemas import DashboardStats


class AdminService:

    @staticmethod
    def get_dashboard_stats(uow: UnitOfWork) -> DashboardStats:
        """Obtiene estadísticas generales del dashboard administrativo."""
        session = uow.session

        total_usuarios = session.exec(
            select(func.count()).where(Usuario.eliminado_en.is_(None))
        ).one()

        total_pedidos = session.exec(
            select(func.count()).select_from(Pedido)
        ).one()

        total_productos = session.exec(
            select(func.count()).where(Producto.eliminado_en.is_(None))
        ).one()

        productos_disponibles = session.exec(
            select(func.count()).where(
                Producto.eliminado_en.is_(None),
                Producto.disponible == True,  # noqa: E712
            )
        ).one()

        pedidos_pendientes = session.exec(
            select(func.count()).where(Pedido.estado_codigo == "PENDIENTE")
        ).one()

        pedidos_entregados = session.exec(
            select(func.count()).where(Pedido.estado_codigo == "ENTREGADO")
        ).one()

        return DashboardStats(
            total_usuarios=total_usuarios or 0,
            total_pedidos=total_pedidos or 0,
            total_productos=total_productos or 0,
            productos_disponibles=productos_disponibles or 0,
            pedidos_pendientes=pedidos_pendientes or 0,
            pedidos_entregados=pedidos_entregados or 0,
        )