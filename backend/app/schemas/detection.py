from datetime import datetime
from pydantic import BaseModel, Field

class DetectionCreate(BaseModel):
    camera_id: str = Field(..., min_length=1, max_length=100)
    timestamp: datetime
    vehicle_number: str | None = Field(None, max_length=50)
    confidence: float = Field(..., ge=0, le=1)
    vehicle_type: str | None = Field(None, max_length=50)
    bounding_box: dict | None = None
    event_type: str = Field(..., min_length=1, max_length=50)

class DetectionResponse(DetectionCreate):
    id: int
    camera_db_id: int
