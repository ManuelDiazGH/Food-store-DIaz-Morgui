"""Schemas de RefreshToken — Minimal, handled by auth module."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RefreshTokenRead(BaseModel):
    id: int
    token_hash: str
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    usuario_id: int
    family_id: str
    created_at: datetime

    model_config = {"from_attributes": True}