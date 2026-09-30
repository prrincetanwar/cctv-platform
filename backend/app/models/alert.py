from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    detection_id: Mapped[int] = mapped_column(ForeignKey("detections.id"), nullable=False, index=True)
    camera_id: Mapped[int] = mapped_column(ForeignKey("cameras.id"), nullable=False, index=True)
    watchlist_entry_id: Mapped[int | None] = mapped_column(ForeignKey("watchlist_entries.id"), nullable=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(30), nullable=False, default="MEDIUM", index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="OPEN", index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
