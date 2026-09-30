from datetime import datetime

from sqlalchemy import DateTime, Float, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    camera_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    camera_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_protocol: Mapped[str] = mapped_column(String(50), nullable=False)
    stream_endpoint_reference: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="OFFLINE", index=True)
    last_heartbeat: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    zone: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    storage_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
