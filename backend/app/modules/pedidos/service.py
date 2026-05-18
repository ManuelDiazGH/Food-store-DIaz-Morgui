"""Service de Pedidos — Lógica de negocio con FSM y audit trail.

Máquina de estados (FSM):
  PENDIENTE → CONFIRMADO
  PENDIENTE → CANCELADO
  CONFIRMADO → EN_PREPARACION
  CONFIRMADO → CANCELADO
  EN_PREPARACION → EN_CAMINO
  EN_CAMINO → ENTREGADO
  ENTREGADO (terminal)
  CANCELADO (terminal)

Stock:
- Al crear el pedido se descuenta el stock atómicamente.
- Al cancelar (cualquier estado no terminal) se restituye el stock.
"""
from decimal import Decimal

from app.core.uow import UnitOfWork
from app.modules.pedidos.schemas import CrearPedidoRequest
from app.models.all_models import Pedido, DetallePedido, HistorialEstadoPedido

# ── FSM transitions ──────────────────────────────────────────────
# Nota: se incluye PENDIENTE → CANCELADO para que el cliente pueda
# abandonar un pedido sin pagar.
VALID_TRANSITIONS: dict[str, set[str]] = {
    "PENDIENTE": {"CONFIRMADO", "CANCELADO"},
    "CONFIRMADO": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"EN_CAMINO", "CANCELADO"},
    "EN_CAMINO": {"ENTREGADO"},
    "ENTREGADO": set(),  # Terminal
    "CANCELADO": set(),  # Terminal
}

# ── Costos fijos del negocio ─────────────────────────────────────
# Fuente única de verdad. El default del modelo y los schemas leen de acá.
COSTO_ENVIO: Decimal = Decimal("50.00")


class PedidoService:

    @staticmethod
    def create(uow: UnitOfWork, usuario_id: int, data: CrearPedidoRequest) -> Pedido:
        """Crea un pedido con snapshots, audit trail y descuento de stock atómico.

        Validaciones:
        - Cada producto existe, no está eliminado y está disponible.
        - Hay stock suficiente para la cantidad pedida.
        - Si se especifica ``direccion_id``, la dirección debe pertenecer al
          ``usuario_id`` autenticado (RN-PE07).

        Efectos colaterales:
        - Descuenta ``cantidad`` del stock de cada producto.
        - Crea entry inicial en ``HistorialEstadoPedido`` (PENDIENTE).
        """
        # ── Validar dirección (ownership) si se pasa ──
        if data.direccion_id is not None:
            direccion = uow.direcciones.get_by_id(data.direccion_id)
            if direccion is None or direccion.eliminado_en is not None:
                raise ValueError("Dirección no encontrada")
            if direccion.usuario_id != usuario_id:
                raise ValueError("La dirección no pertenece al usuario")
        else:
            direccion = None

        total = COSTO_ENVIO  # Arrancar con el costo de envío

        # ── Verificar productos, calcular total y reservar stock ──
        detalle_objects: list[DetallePedido] = []
        productos_a_descontar: list[tuple] = []  # (producto, cantidad)
        for item in data.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is None or producto.eliminado_en is not None:
                raise ValueError(f"Producto {item.producto_id} no encontrado")
            if not producto.disponible:
                raise ValueError(f"Producto '{producto.nombre}' no disponible")
            if producto.stock_cantidad < item.cantidad:
                raise ValueError(
                    f"Stock insuficiente para '{producto.nombre}' "
                    f"(disponible: {producto.stock_cantidad}, pedido: {item.cantidad})"
                )

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
            productos_a_descontar.append((producto, item.cantidad))

        # ── Descontar stock atómicamente (misma transacción) ──
        for producto, cantidad in productos_a_descontar:
            producto.stock_cantidad -= cantidad
            uow.session.add(producto)
        uow.session.flush()

        # ── Crear pedido ──
        pedido = Pedido(
            usuario_id=usuario_id,
            estado_codigo="PENDIENTE",
            total=total,
            costo_envio=COSTO_ENVIO,
            forma_pago_codigo=data.forma_pago_codigo,
            direccion_id=data.direccion_id,
            notas=data.notas,
        )

        # Address snapshot (RN-PE03)
        if direccion is not None:
            pedido.direccion_snapshot_alias = direccion.alias
            pedido.direccion_snapshot_linea1 = direccion.linea1
            pedido.direccion_snapshot_linea2 = direccion.linea2
            pedido.direccion_snapshot_ciudad = direccion.ciudad
            pedido.direccion_snapshot_cp = direccion.cp

        uow.pedidos.create(pedido)
        uow.session.flush()  # Obtener pedido.id

        # ── Asignar pedido_id a detalles y crearlos ──
        for detalle in detalle_objects:
            detalle.pedido_id = pedido.id
            uow.session.add(detalle)
        uow.session.flush()

        # ── Historial inicial (PENDIENTE, sin estado_desde) ──
        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde=None,
            estado_hasta="PENDIENTE",
            usuario_id=usuario_id,
        )
        uow.session.add(historial)
        uow.session.flush()

        # Poblar relaciones para evitar lazy-load fuera de sesión
        pedido.detalles = detalle_objects
        pedido.historial = [historial]
        pedido.pagos = []

        return pedido

    @staticmethod
    def validar_items(uow: UnitOfWork, items_data: list[dict]) -> dict:
        """Valida items antes de crear el pedido (EPIC 09).

        Returns:
            dict with 'valido', 'items' (list of validated item dicts), 'errores' (list of str).
        """
        resultados = []
        errores: list[str] = []
        valido = True

        for item in items_data:
            producto_id = item["producto_id"]
            cantidad = item["cantidad"]
            precio_original = item.get("precio_original", 0)

            producto = uow.productos.get_by_id(producto_id)

            if producto is None or producto.eliminado_en is not None:
                errores.append(f"Producto ID {producto_id} no encontrado o eliminado")
                resultados.append({
                    "producto_id": producto_id,
                    "nombre": "?",
                    "disponible": False,
                    "hay_stock": False,
                    "stock_disponible": 0,
                    "precio_actual": Decimal("0"),
                    "precio_original": Decimal(str(precio_original)),
                    "hubo_cambio_precio": False,
                })
                valido = False
                continue

            sin_stock = producto.stock_cantidad < cantidad
            if sin_stock:
                errores.append(
                    f"Stock insuficiente para '{producto.nombre}': "
                    f"solicitado {cantidad}, disponible {producto.stock_cantidad}"
                )
                valido = False

            precio_actual = producto.precio_base
            hubo_cambio = Decimal(str(precio_original)) != precio_actual

            if hubo_cambio:
                errores.append(
                    f"El precio de '{producto.nombre}' cambió: "
                    f"${float(precio_original):.2f} → ${float(precio_actual):.2f}"
                )
                valido = False

            resultados.append({
                "producto_id": producto.id,
                "nombre": producto.nombre,
                "disponible": producto.disponible and producto.eliminado_en is None,
                "hay_stock": not sin_stock,
                "stock_disponible": producto.stock_cantidad,
                "precio_actual": precio_actual,
                "precio_original": Decimal(str(precio_original)),
                "hubo_cambio_precio": hubo_cambio,
            })

        return {"valido": valido, "items": resultados, "errores": errores}

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
    def count_by_usuario(uow: UnitOfWork, usuario_id: int) -> int:
        return uow.pedidos.count_by_usuario(usuario_id)

    @staticmethod
    def get_all(uow: UnitOfWork, offset: int = 0, limit: int = 100) -> list[Pedido]:
        return uow.pedidos.get_all(offset=offset, limit=limit)

    @staticmethod
    def listar_pedidos(
        uow: UnitOfWork,
        q: str | None = None,
        estado: str | None = None,
        desde: str | None = None,
        hasta: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Pedido], int]:
        """Lista pedidos con filtros y paginación server-side."""
        return uow.pedidos.search(q=q, estado=estado, desde=desde, hasta=hasta, page=page, limit=limit)

    @staticmethod
    def get_historial(uow: UnitOfWork, pedido_id: int) -> list[HistorialEstadoPedido]:
        """Retorna el historial de estados de un pedido (append-only audit trail)."""
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise ValueError("Pedido no encontrado")
        return list(pedido.historial)

    @staticmethod
    def transicionar_estado(
        uow: UnitOfWork,
        pedido_id: int,
        estado_hasta: str,
        usuario_id: int,
        observacion: str | None = None,
    ) -> Pedido:
        """Transiciona el estado de un pedido validando la FSM.

        Si la transición es a CANCELADO, restituye el stock de los detalles.

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

        # Si se cancela, restituir stock.
        if estado_hasta == "CANCELADO":
            PedidoService._restore_stock(uow, pedido)

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

    @staticmethod
    def _restore_stock(uow: UnitOfWork, pedido: Pedido) -> None:
        """Restituye el stock de todos los items de un pedido (al cancelar)."""
        for detalle in pedido.detalles:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is None:
                # Producto borrado mientras tanto: lo saltamos en silencio.
                continue
            producto.stock_cantidad += detalle.cantidad
            uow.session.add(producto)
        uow.session.flush()
