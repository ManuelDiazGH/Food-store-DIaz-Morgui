"""Router de RefreshTokens — Admin-only endpoints."""
from fastapi import APIRouter, Depends

from app.core.uow import UnitOfWork
from app.core.dependencies import require_role

router = APIRouter(prefix="/api/v1/refreshtokens", tags=["RefreshTokens"])


@router.delete("/user/{usuario_id}", status_code=204,
               dependencies=[Depends(require_role("ADMIN"))])
def revoke_all_tokens(usuario_id: int):
    """Revoca todos los refresh tokens de un usuario. Solo ADMIN."""
    from app.modules.refreshtokens.service import RefreshTokenService
    with UnitOfWork() as uow:
        RefreshTokenService.revoke_all_for_user(uow, usuario_id)
        uow.commit()