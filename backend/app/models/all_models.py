from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey

from sqlmodel import (
    ARRAY, Column, DateTime, Field, Integer, Numeric,
    Relationship, SQLModel, func,
)


class Rol(SQLModel, table=True):
    __tablename__ = "rol"

    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(max_length=100)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    usuarios: list["UsuarioRol"] = Relationship(back_populates="rol", sa_relationship_kwargs={"lazy": "selectin"})


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: int = Field(primary_key=True)
    email: str = Field(max_length=254, unique=True, index=True)
    password_hash: str = Field(max_length=60)
    nombre: str = Field(max_length=100)
    telefono: Optional[str] = Field(max_length=20, default=None)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )
    eliminado_en: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True),
    )

    roles: list["UsuarioRol"] = Relationship(
        back_populates="usuario",
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]", "lazy": "selectin"},
    )
    refresh_tokens: list["RefreshToken"] = Relationship(back_populates="usuario", sa_relationship_kwargs={"lazy": "selectin"})
    direcciones: list["DireccionEntrega"] = Relationship(back_populates="usuario", sa_relationship_kwargs={"lazy": "selectin"})
    pedidos: list["Pedido"] = Relationship(back_populates="usuario", sa_relationship_kwargs={"lazy": "selectin"})


class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuariorol"

    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    rol_codigo: str = Field(foreign_key="rol.codigo", primary_key=True, max_length=20)
    asignado_por_id: Optional[int] = Field(foreign_key="usuario.id", default=None)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    usuario: "Usuario" = Relationship(
        back_populates="roles",
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]", "lazy": "selectin"},
    )
    rol: "Rol" = Relationship(back_populates="usuarios", sa_relationship_kwargs={"lazy": "selectin"})


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refreshtoken"

    id: int = Field(primary_key=True)
    token_hash: str = Field(max_length=64, unique=True)
    expires_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    revoked_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    usuario_id: int = Field(foreign_key="usuario.id")
    family_id: str = Field(max_length=36)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    usuario: "Usuario" = Relationship(back_populates="refresh_tokens", sa_relationship_kwargs={"lazy": "selectin"})


class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direccionentrega"

    id: int = Field(primary_key=True)
    alias: Optional[str] = Field(max_length=50, default=None)
    linea1: str = Field(max_length=255)
    linea2: Optional[str] = Field(max_length=255, default=None)
    ciudad: str = Field(max_length=100)
    cp: str = Field(max_length=20)
    es_principal: bool = Field(default=False)
    usuario_id: int = Field(foreign_key="usuario.id")
    eliminado_en: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    usuario: "Usuario" = Relationship(back_populates="direcciones", sa_relationship_kwargs={"lazy": "selectin"})


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: int = Field(primary_key=True)
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(max_length=500, default=None)
    padre_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("categoria.id", ondelete="SET NULL")),
    )
    eliminado_en: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    subcategorias: list["Categoria"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"foreign_keys": "Categoria.padre_id", "lazy": "selectin"},
    )
    parent: Optional["Categoria"] = Relationship(
        back_populates="subcategorias",
        sa_relationship_kwargs={"remote_side": "Categoria.id", "lazy": "selectin"},
    )


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: int = Field(primary_key=True)
    nombre: str = Field(max_length=200)
    descripcion: Optional[str] = Field(max_length=2000, default=None)
    precio_base: Decimal = Field(
        max_digits=10, decimal_places=2,
        sa_column=Column(Numeric(10, 2), nullable=False),
    )
    stock_cantidad: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    imagen: Optional[str] = Field(max_length=500, default=None)
    eliminado_en: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    categorias: list["ProductoCategoria"] = Relationship(back_populates="producto", sa_relationship_kwargs={"lazy": "selectin"})
    ingredientes: list["ProductoIngrediente"] = Relationship(back_populates="producto", sa_relationship_kwargs={"lazy": "selectin"})


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingrediente"

    id: int = Field(primary_key=True)
    nombre: str = Field(max_length=100, unique=True)
    es_alergeno: bool = Field(default=False)
    eliminado_en: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True), nullable=True),
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )


class ProductoCategoria(SQLModel, table=True):
    __tablename__ = "productocategoria"

    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", primary_key=True)
    es_principal: bool = Field(default=False)

    producto: "Producto" = Relationship(back_populates="categorias", sa_relationship_kwargs={"lazy": "selectin"})
    categoria: "Categoria" = Relationship(sa_relationship_kwargs={"lazy": "selectin"})


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "productoingrediente"

    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    ingrediente_id: int = Field(foreign_key="ingrediente.id", primary_key=True)
    es_removible: bool = Field(default=True)

    producto: "Producto" = Relationship(back_populates="ingredientes", sa_relationship_kwargs={"lazy": "selectin"})
    ingrediente: "Ingrediente" = Relationship(sa_relationship_kwargs={"lazy": "selectin"})


class FormaPago(SQLModel, table=True):
    __tablename__ = "formapago"

    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(max_length=100)
    habilitado: bool = Field(default=True)


class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estadopedido"

    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(max_length=100)
    orden: int = Field(unique=True)
    es_terminal: bool = Field(default=False)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: int = Field(primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado_codigo: str = Field(
        foreign_key="estadopedido.codigo", max_length=20, default="PENDIENTE",
    )
    total: Decimal = Field(
        max_digits=10, decimal_places=2,
        sa_column=Column(Numeric(10, 2), nullable=False),
    )
    costo_envio: Decimal = Field(
        max_digits=10, decimal_places=2, default=50.00,
    )
    forma_pago_codigo: str = Field(
        foreign_key="formapago.codigo", max_length=20,
    )
    direccion_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("direccionentrega.id", ondelete="SET NULL")),
    )
    notas: Optional[str] = Field(max_length=1000, default=None)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos", sa_relationship_kwargs={"lazy": "selectin"})
    detalles: list["DetallePedido"] = Relationship(back_populates="pedido", sa_relationship_kwargs={"lazy": "selectin"})
    historial: list["HistorialEstadoPedido"] = Relationship(back_populates="pedido", sa_relationship_kwargs={"lazy": "selectin"})
    pagos: list["Pago"] = Relationship(back_populates="pedido", sa_relationship_kwargs={"lazy": "selectin"})


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detallepedido"

    id: int = Field(primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    nombre_snapshot: str = Field(max_length=200)
    precio_snapshot: Decimal = Field(
        max_digits=10, decimal_places=2,
        sa_column=Column(Numeric(10, 2), nullable=False),
    )
    cantidad: int = Field(ge=1)
    personalizacion: Optional[list[int]] = Field(
        default=None, sa_column=Column(ARRAY(Integer)),
    )

    pedido: "Pedido" = Relationship(back_populates="detalles", sa_relationship_kwargs={"lazy": "selectin"})
    producto: "Producto" = Relationship(sa_relationship_kwargs={"lazy": "selectin"})


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historialestadopedido"

    id: int = Field(primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    estado_desde: Optional[str] = Field(
        foreign_key="estadopedido.codigo", max_length=20, default=None,
    )
    estado_hasta: str = Field(
        foreign_key="estadopedido.codigo", max_length=20,
    )
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False,
        ),
    )
    usuario_id: Optional[int] = Field(foreign_key="usuario.id", default=None)
    observacion: Optional[str] = Field(max_length=500, default=None)
    motivo: Optional[str] = Field(max_length=500, default=None)

    pedido: "Pedido" = Relationship(back_populates="historial", sa_relationship_kwargs={"lazy": "selectin"})


class Pago(SQLModel, table=True):
    __tablename__ = "pago"

    id: int = Field(primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    mp_payment_id: Optional[int] = Field(unique=True, default=None)
    mp_status: str = Field(max_length=30)
    external_reference: str = Field(max_length=100, unique=True)
    idempotency_key: str = Field(max_length=100, unique=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )

    pedido: "Pedido" = Relationship(back_populates="pagos", sa_relationship_kwargs={"lazy": "selectin"})
