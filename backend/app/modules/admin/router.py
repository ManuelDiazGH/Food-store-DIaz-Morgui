"""Router de administración para Food Store."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])
