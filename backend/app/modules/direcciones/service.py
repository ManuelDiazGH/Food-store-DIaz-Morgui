"""Service de Direcciones — Lógica de negocio CRUD."""
from app.core.uow import UnitOfWork
from app.modules.direcciones.schemas import DireccionCreate, DireccionUpdate
from app.models.all_models import DireccionEntrega


class DireccionService:

    @staticmethod
    def create(uow: UnitOfWork, usuario_id: int, data: DireccionCreate) -> DireccionEntrega:
        direccion = DireccionEntrega(
            alias=data.alias,
            linea1=data.linea1,
            linea2=data.linea2,
            ciudad=data.ciudad,
            cp=data.cp,
            es_principal=data.es_principal,
            usuario_id=usuario_id,
        )
        # Si es principal, desactivar las demás
        if data.es_principal:
            Direcciones = uow.direcciones.get_by_usuario(usuario_id)
            for d in Direcciones:
                d.es_principal = False
                uow.session.add(d)

        return uow.direcciones.create(direccion)

    @staticmethod
    def get_by_id(uow: UnitOfWork, id: int) -> DireccionEntrega:
        direccion = uow.direcciones.get_by_id(id)
        if direccion is None or direccion.eliminado_en is not None:
            raise ValueError("Dirección no encontrada")
        return direccion

    @staticmethod
    def get_by_usuario(uow: UnitOfWork, usuario_id: int) -> list[DireccionEntrega]:
        return uow.direcciones.get_by_usuario(usuario_id)

    @staticmethod
    def update(uow: UnitOfWork, id: int, data: DireccionUpdate) -> DireccionEntrega:
        direccion = uow.direcciones.get_by_id(id)
        if direccion is None or direccion.eliminado_en is not None:
            raise ValueError("Dirección no encontrada")

        if data.alias is not None:
            direccion.alias = data.alias
        if data.linea1 is not None:
            direccion.linea1 = data.linea1
        if data.linea2 is not None:
            direccion.linea2 = data.linea2
        if data.ciudad is not None:
            direccion.ciudad = data.ciudad
        if data.cp is not None:
            direccion.cp = data.cp

        return uow.direcciones.update(direccion)

    @staticmethod
    def set_principal(uow: UnitOfWork, id: int) -> DireccionEntrega:
        """Establece una dirección como principal del usuario."""
        direccion = uow.direcciones.get_by_id(id)
        if direccion is None or direccion.eliminado_en is not None:
            raise ValueError("Dirección no encontrada")

        # Desactivar la principal actual del mismo usuario
        principal = uow.direcciones.get_principal(direccion.usuario_id)
        if principal:
            principal.es_principal = False
            uow.session.add(principal)

        direccion.es_principal = True
        return uow.direcciones.update(direccion)

    @staticmethod
    def delete(uow: UnitOfWork, id: int) -> bool:
        return uow.direcciones.delete(id)