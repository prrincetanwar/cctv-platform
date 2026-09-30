from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class WatchlistBase(BaseModel):
    entity_type: str = Field(..., min_length=1, max_length=50)
    entity_identifier: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    priority: str = Field("MEDIUM", max_length=30)
    is_active: bool = True

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    entity_type: str | None = Field(None, min_length=1, max_length=50)
    entity_identifier: str | None = Field(None, min_length=1, max_length=100)
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    priority: str | None = Field(None, max_length=30)
    is_active: bool | None = None

class WatchlistResponse(WatchlistBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
