from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WatchlistEntry(Base):
    __tablename__ = "watchlist_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_identifier: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(30), nullable=False, default="MEDIUM", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
