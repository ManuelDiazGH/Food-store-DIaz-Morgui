"""Router de pedidos para Food Store."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])
