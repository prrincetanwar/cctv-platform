from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def record_audit(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    description: str | None = None,
    details: dict | None = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        details=details,
    )
    db.add(entry)
    db.flush()
    return entry
