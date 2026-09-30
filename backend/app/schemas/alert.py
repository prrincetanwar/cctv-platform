from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class AlertResponse(BaseModel):
    id: int
    detection_id: int
    camera_id: int
    watchlist_entry_id: int | None
    timestamp: datetime
    latitude: float | None
    longitude: float | None
    confidence: float
    severity: str
    status: str
    description: str | None
