from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Detection(Base):
    __tablename__ = "detections"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    camera_id: Mapped[int] = mapped_column(ForeignKey("cameras.id"), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    vehicle_number: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    vehicle_type: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    bounding_box: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
