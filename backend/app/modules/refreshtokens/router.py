"""Router de refresh tokens para Food Store."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/refreshtokens", tags=["Refresh Tokens"])
