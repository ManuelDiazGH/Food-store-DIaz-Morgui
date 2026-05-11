"""Router de autenticación para Food Store."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
