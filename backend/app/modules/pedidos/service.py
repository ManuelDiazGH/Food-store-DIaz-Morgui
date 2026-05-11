"""Service de Pedidos — Lógica de negocio con FSM y audit trail.

Máquina de estados (FSM):
  PENDIENTE → CONFIRMADO
  CONFIRMADO → EN_PREPARACION
  CONFIRMADO → CANCELADO
  EN_PREPARACION → EN_CAMINO
  EN_CAMINO → ENTREGADO
  ENTREGADO (terminal)
  CANCELADO (terminal)
"""
from datetime import datetime, timezone
from decimal import Decimal

from app.core.uow import UnitOfWork
from app.modules.pedidos.schemas import CrearPedidoRequest, EstadoUpdateRequest
from app.models.all_models import Pedido, DetallePedido, HistorialEstadoPedido

# ── FSM transitions ──────────────────────────────────────────────
VALID_TRANSITIONS: dict[str, set[str]] = {
    "PENDIENTE": {"CONFIRMADO"},
    "CONFIRMADO": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"EN_CAMINO"},
    "EN_CAMINO": {"ENTREGADO"},
    "ENTREGADO": set(),  # Terminal
    "CANCELADO": set(),   # Terminal
}

COSTO_ENVIO = Decimal("50.00")


class PedidoService:

    @staticmethod
    def create(uow: UnitOfWork, usuario_id: int, data: CrearPedidoRequest) -> Pedido:
        """Crea un pedido con snapshots y audit trail."""
        total = COSTO_ENVIO  # Arrancar con el costo de envío

        # Verificar productos y calcular total
        detalle_objects: list[DetallePedido] = []
        for item in data.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is None or producto.eliminado_en is not None:
                raise ValueError(f"Producto {item.producto_id} no encontrado")
            if not producto.disponible:
                raise ValueError(f"Producto '{producto.nombre}' no disponible")
            if producto.stock_cantidad < item.cantidad:
                raise ValueError(f"Stock insuficiente para '{producto.nombre}'")

            subtotal = producto.precio_base * item.cantidad
            total += subtotal

            detalle = DetallePedido(
                pedido_id=0,  # Se asigna después del flush
                producto_id=producto.id,
                nombre_snapshot=producto.nombre,
                precio_snapshot=producto.precio_base,
                cantidad=item.cantidad,
                personalizacion=item.personalizacion,
            )
            detalle_objects.append(detalle)

        # Crear pedido
        pedido = Pedido(
            usuario_id=usuario_id,
            estado_codigo="PENDIENTE",
            total=total,
            costo_envio=COSTO_ENVIO,
            forma_pago_codigo=data.forma_pago_codigo,
            direccion_id=data.direccion_id,
            notas=data.notas,
        )
        uow.pedidos.create(pedido)
        uow.session.flush()  # Obtener pedido.id

        # Asignar pedido_id a detalles y crearlos
        for detalle in detalle_objects:
            detalle.pedido_id = pedido.id
            uow.session.add(detalle)

        # Crear historial inicial (PENDIENTE, sin estado_desde)
        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde=None,
            estado_hasta="PENDIENTE",
            usuario_id=usuario_id,
        )
        uow.session.add(historial)

        return pedido

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise ValueError("Pedido no encontrado")
        return pedido

    @staticmethod
    def get_by_usuario(uow: UnitOfWork, usuario_id: int, offset: int = 0, limit: int = 100) -> list[Pedido]:
        return uow.pedidos.get_by_usuario(usuario_id, offset=offset, limit=limit)

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Pedido]:
        return uow.pedidos.get_all(offset=offset, limit=limit)

    @staticmethod
    def transicionar_estado(
        uow: UnitOfWork,
        pedido_id: int,
        estado_hasta: str,
        usuario_id: int,
        observacion: str | None = None,
    ) -> Pedido:
        """Transiciona el estado de un pedido validando la FSM.

        Raises:
            ValueError: Si la transición no es válida o el pedido está en estado terminal.
        """
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise ValueError("Pedido no encontrado")

        estado_actual = pedido.estado_codigo

        # Verificar estados terminales
        if estado_actual in ("ENTREGADO", "CANCELADO"):
            raise ValueError(f"El pedido está en estado terminal '{estado_actual}' y no puede cambiar")

        # Validar transición
        validos = VALID_TRANSITIONS.get(estado_actual, set())
        if estado_hasta not in validos:
            raise ValueError(
                f"Transición inválida: '{estado_actual}' → '{estado_hasta}'. "
                f"Transiciones válidas: {', '.join(sorted(validos)) or 'ninguna'}"
            )

        # Actualizar estado del pedido
        pedido.estado_codigo = estado_hasta
        uow.pedidos.update(pedido)

        # Crear entrada en audit trail
        historial = HistorialEstadoPedido(
            pedido_id=pedido_id,
            estado_desde=estado_actual,
            estado_hasta=estado_hasta,
            usuario_id=usuario_id,
            observacion=observacion,
        )
        uow.session.add(historial)

        return pedido