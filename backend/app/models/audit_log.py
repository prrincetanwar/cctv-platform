from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
