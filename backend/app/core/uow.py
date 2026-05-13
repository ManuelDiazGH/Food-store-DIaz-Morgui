"""Unit of Work — Gestión transaccional para operaciones atómicas.

Provee acceso a todos los repositorios y garantiza que las
operaciones se commiten juntas o se reviertan en caso de error.

Uso:
    with UnitOfWork() as uow:
        user = uow.usuarios.create(Usuario(email="a@b.com", ...))
        role = uow.roles.get_by_id("ADMIN")
        # Auto-commit al salir del bloque si no hay excepción
"""
from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    """Unit of Work pattern para transacciones atómicas.

    Abre una sesión de BD, provee acceso a todos los repositorios,
    y hace commit automático al salir sin excepciones o rollback
    si ocurre un error.
    """

    def __init__(self):
        self.session: Session = Session(engine, expire_on_commit=False)
        self._committed: bool = False

    def __enter__(self) -> "UnitOfWork":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type:
            self.session.rollback()
        elif not self._committed:
            self.commit()
        self.session.close()

    def commit(self) -> None:
        """Persiste todos los cambios en la transacción actual."""
        self.session.commit()
        self._committed = True

    def rollback(self) -> None:
        """Revierte todos los cambios de la transacción actual."""
        self.session.rollback()
        self._committed = True

    # ── Repository properties (lazy import para evitar circular imports) ──

    @property
    def usuarios(self):
        from app.modules.usuarios.repository import UsuarioRepository
        from app.models.all_models import Usuario
        return UsuarioRepository(Usuario, self.session)

    @property
    def usuario_roles(self):
        from app.modules.usuarios.repository import UsuarioRolRepository
        from app.models.all_models import UsuarioRol
        return UsuarioRolRepository(UsuarioRol, self.session)

    @property
    def roles(self):
        from app.modules.categorias.repository import RolRepository
        from app.models.all_models import Rol
        return RolRepository(Rol, self.session)

    @property
    def categorias(self):
        from app.modules.categorias.repository import CategoriaRepository
        from app.models.all_models import Categoria
        return CategoriaRepository(Categoria, self.session)

    @property
    def productos(self):
        from app.modules.productos.repository import ProductoRepository
        from app.models.all_models import Producto
        return ProductoRepository(Producto, self.session)

    @property
    def ingredientes(self):
        from app.modules.ingredientes.repository import IngredienteRepository
        from app.models.all_models import Ingrediente
        return IngredienteRepository(Ingrediente, self.session)

    @property
    def pedidos(self):
        from app.modules.pedidos.repository import PedidoRepository
        from app.models.all_models import Pedido
        return PedidoRepository(Pedido, self.session)

    @property
    def detalles_pedido(self):
        from app.modules.pedidos.repository import DetallePedidoRepository
        from app.models.all_models import DetallePedido
        return DetallePedidoRepository(DetallePedido, self.session)

    @property
    def historial_estados(self):
        from app.modules.pedidos.repository import HistorialEstadoPedidoRepository
        from app.models.all_models import HistorialEstadoPedido
        return HistorialEstadoPedidoRepository(HistorialEstadoPedido, self.session)

    @property
    def estados_pedido(self):
        from app.modules.pedidos.repository import EstadoPedidoRepository
        from app.models.all_models import EstadoPedido
        return EstadoPedidoRepository(EstadoPedido, self.session)

    @property
    def pagos(self):
        from app.modules.pagos.repository import PagoRepository
        from app.models.all_models import Pago
        return PagoRepository(Pago, self.session)

    @property
    def formas_pago(self):
        from app.modules.pagos.repository import FormaPagoRepository
        from app.models.all_models import FormaPago
        return FormaPagoRepository(FormaPago, self.session)

    @property
    def direcciones(self):
        from app.modules.direcciones.repository import DireccionEntregaRepository
        from app.models.all_models import DireccionEntrega
        return DireccionEntregaRepository(DireccionEntrega, self.session)

    @property
    def refreshtokens(self):
        from app.modules.refreshtokens.repository import RefreshTokenRepository
        from app.models.all_models import RefreshToken
        return RefreshTokenRepository(RefreshToken, self.session)

    @property
    def auth(self):
        from app.modules.auth.repository import AuthRepository
        from app.models.all_models import Usuario
        return AuthRepository(Usuario, self.session)