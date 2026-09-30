from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_roles
from app.db.session_dependency import get_db
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("")
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin")),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    statement = (
        select(AuditLog)
        .order_by(AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
    )
    logs = list(db.scalars(statement).all())

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "details": log.details,
            "created_at": log.created_at,
        }
        for log in logs
    ]
