"""Service de Admin — Dashboard y métricas."""
from datetime import datetime, time, timezone
from typing import Optional

from sqlalchemy import cast, Date, String, Text, func as sa_func
from sqlmodel import func, select

from app.core.uow import UnitOfWork
from app.models.all_models import DetallePedido, Pedido, Producto, Usuario, UsuarioRol
from app.modules.admin.schemas import DashboardStats, MetricasCompletas, PedidoPorEstado, TopProducto, VentaPorPeriodo

# Cuentas finales / clientes (excluye admin, stock, pedidos, repartidor).
CLIENT_ROLE_CODE = "CLIENT"


def _parse_rango(desde: Optional[str], hasta: Optional[str]) -> tuple[datetime, datetime]:
    """Parsea desde/hasta (YYYY-MM-DD) a un rango inclusivo en UTC.

    `desde` arranca a 00:00:00 UTC del día; `hasta` termina a 23:59:59.999999 UTC
    para que los pedidos del último día queden incluidos (antes hasta=YYYY-MM-DD
    se interpretaba como medianoche del inicio y excluía el día entero).
    """
    if desde:
        desde_dt = datetime.fromisoformat(desde).replace(tzinfo=timezone.utc)
    else:
        desde_dt = datetime.min.replace(tzinfo=timezone.utc)

    if hasta:
        # Fin de día inclusivo
        hasta_base = datetime.fromisoformat(hasta).replace(tzinfo=timezone.utc)
        hasta_dt = datetime.combine(hasta_base.date(), time.max, tzinfo=timezone.utc)
    else:
        hasta_dt = datetime.now(timezone.utc)

    return desde_dt, hasta_dt

_GRANULARIDAD_MAP = {
    "dia": "day",
    "semana": "week",
    "mes": "month",
}

_DATE_FORMAT_MAP = {
    "day": "YYYY-MM-DD",
    "week": 'IYYY-"W"IW',
    "month": "YYYY-MM",
}


class AdminService:

    @staticmethod
    def _count_clientes_activos(session) -> int:
        """Cuenta usuarios con rol CLIENT, activos y no eliminados.

        Cada cuenta de cliente se cuenta una sola vez (DISTINCT por si en el
        futuro un usuario tuviera CLIENT asignado dos veces, aunque la PK
        compuesta de UsuarioRol ya lo previene).
        """
        result = session.exec(
            select(func.count(func.distinct(Usuario.id)))
            .select_from(Usuario)
            .join(UsuarioRol, UsuarioRol.usuario_id == Usuario.id)
            .where(
                UsuarioRol.rol_codigo == CLIENT_ROLE_CODE,
                Usuario.activo == True,  # noqa: E712
                Usuario.eliminado_en.is_(None),
            )
        ).one()
        return result or 0

    @staticmethod
    def get_dashboard_stats(uow: UnitOfWork) -> DashboardStats:
        """Obtiene estadísticas generales del dashboard administrativo."""
        session = uow.session

        total_usuarios = AdminService._count_clientes_activos(session)

        total_pedidos = session.exec(
            select(func.count()).select_from(Pedido)
        ).one()

        total_productos = session.exec(
            select(func.count()).select_from(Producto).where(Producto.eliminado_en.is_(None))
        ).one()

        productos_disponibles = session.exec(
            select(func.count()).select_from(Producto).where(
                Producto.eliminado_en.is_(None),
                Producto.disponible == True,  # noqa: E712
            )
        ).one()

        pedidos_pendientes = session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado_codigo == "PENDIENTE")
        ).one()

        pedidos_entregados = session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado_codigo == "ENTREGADO")
        ).one()

        return DashboardStats(
            total_usuarios=total_usuarios,
            total_pedidos=total_pedidos or 0,
            total_productos=total_productos or 0,
            productos_disponibles=productos_disponibles or 0,
            pedidos_pendientes=pedidos_pendientes or 0,
            pedidos_entregados=pedidos_entregados or 0,
        )

    @staticmethod
    def get_metricas_resumen(uow: UnitOfWork) -> dict:
        """Obtiene conteos generales para métricas completas."""
        session = uow.session

        total_usuarios = AdminService._count_clientes_activos(session)

        total_pedidos = session.exec(
            select(func.count()).select_from(Pedido)
        ).one()

        total_productos = session.exec(
            select(func.count()).select_from(Producto).where(Producto.eliminado_en.is_(None))
        ).one()

        total_ventas = session.exec(
            select(sa_func.coalesce(sa_func.sum(Pedido.total), 0)).where(
                ~Pedido.estado_codigo.in_(["CANCELADO", "PENDIENTE"])
            )
        ).one()

        return {
            "total_usuarios": total_usuarios,
            "total_pedidos": total_pedidos or 0,
            "total_productos": total_productos or 0,
            "total_ventas": float(total_ventas or 0),
        }

    @staticmethod
    def get_ventas_por_periodo(
        uow: UnitOfWork,
        desde: Optional[str] = None,
        hasta: Optional[str] = None,
        granularidad: str = "dia",
    ) -> list[VentaPorPeriodo]:
        """Agrupa ventas por período con DATE_TRUNC."""
        session = uow.session
        pg_gran = _GRANULARIDAD_MAP.get(granularidad, "day")
        date_fmt = _DATE_FORMAT_MAP.get(pg_gran, "YYYY-MM-DD")

        desde_dt, hasta_dt = _parse_rango(desde, hasta)

        rows = session.exec(
            select(
                sa_func.to_char(
                    sa_func.date_trunc(pg_gran, Pedido.created_at), date_fmt
                ).label("periodo"),
                sa_func.coalesce(sa_func.sum(Pedido.total), 0).label("monto"),
                func.count().label("cantidad"),
            ).where(
                ~Pedido.estado_codigo.in_(["CANCELADO", "PENDIENTE"]),
                Pedido.created_at >= desde_dt,
                Pedido.created_at <= hasta_dt,
            ).group_by(
                sa_func.date_trunc(pg_gran, Pedido.created_at)
            ).order_by(
                sa_func.date_trunc(pg_gran, Pedido.created_at)
            )
        ).all()

        return [
            VentaPorPeriodo(periodo=r.periodo, monto=float(r.monto), cantidad=r.cantidad)
            for r in rows
        ]

    @staticmethod
    def get_top_productos(
        uow: UnitOfWork,
        top: int = 10,
        desde: Optional[str] = None,
        hasta: Optional[str] = None,
    ) -> list[TopProducto]:
        """Obtiene los productos más vendidos."""
        session = uow.session

        desde_dt, hasta_dt = _parse_rango(desde, hasta)

        rows = session.exec(
            select(
                Producto.nombre,
                sa_func.coalesce(sa_func.sum(DetallePedido.cantidad), 0).label("cantidad_vendida"),
                sa_func.coalesce(
                    sa_func.sum(DetallePedido.precio_snapshot * DetallePedido.cantidad), 0
                ).label("ingreso_total"),
            ).join(
                Producto, DetallePedido.producto_id == Producto.id
            ).join(
                Pedido, DetallePedido.pedido_id == Pedido.id
            ).where(
                ~Pedido.estado_codigo.in_(["CANCELADO", "PENDIENTE"]),
                Pedido.created_at >= desde_dt,
                Pedido.created_at <= hasta_dt,
                Producto.eliminado_en.is_(None),
            ).group_by(
                Producto.id, Producto.nombre
            ).order_by(
                sa_func.sum(DetallePedido.cantidad).desc()
            ).limit(top)
        ).all()

        return [
            TopProducto(
                nombre=r.nombre,
                cantidad_vendida=r.cantidad_vendida,
                ingreso_total=float(r.ingreso_total),
            )
            for r in rows
        ]

    @staticmethod
    def get_pedidos_por_estado(
        uow: UnitOfWork,
        desde: Optional[str] = None,
        hasta: Optional[str] = None,
    ) -> list[PedidoPorEstado]:
        """Agrupa pedidos por estado."""
        session = uow.session

        desde_dt, hasta_dt = _parse_rango(desde, hasta)

        rows = session.exec(
            select(
                Pedido.estado_codigo.label("estado"),
                func.count().label("cantidad"),
            ).where(
                Pedido.created_at >= desde_dt,
                Pedido.created_at <= hasta_dt,
            ).group_by(
                Pedido.estado_codigo
            ).order_by(
                Pedido.estado_codigo
            )
        ).all()

        return [
            PedidoPorEstado(estado=r.estado, cantidad=r.cantidad)
            for r in rows
        ]