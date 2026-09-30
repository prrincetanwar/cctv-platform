from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CameraBase(BaseModel):
    camera_id: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1, max_length=100)
    latitude: float
    longitude: float
    camera_type: str = Field(..., min_length=1, max_length=100)
    source_protocol: str = Field(..., min_length=1, max_length=50)
    stream_endpoint_reference: str = Field(..., min_length=1)
    zone: str | None = Field(None, max_length=100)
    storage_metadata: dict | None = None

class CameraCreate(CameraBase):
    status: str = Field("OFFLINE", max_length=30)

class CameraUpdate(BaseModel):
    camera_id: str | None = Field(None, min_length=1, max_length=100)
    name: str | None = Field(None, min_length=1, max_length=200)
    department: str | None = Field(None, min_length=1, max_length=100)
    latitude: float | None = None
    longitude: float | None = None
    camera_type: str | None = Field(None, min_length=1, max_length=100)
    source_protocol: str | None = Field(None, max_length=50)
    stream_endpoint_reference: str | None = Field(None, min_length=1)
    status: str | None = Field(None, max_length=30)
    zone: str | None = Field(None, max_length=100)
    storage_metadata: dict | None = None

class CameraResponse(CameraBase):
    id: int
    status: str
    last_heartbeat: datetime | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
