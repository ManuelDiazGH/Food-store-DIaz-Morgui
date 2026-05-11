"""Router de productos para Food Store."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])
