from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from app.schemas.detection import DetectionCreate
from app.websocket.manager import serialize_alert


def test_alert_websocket_payload_contains_complete_contract():
    alert = SimpleNamespace(
        id=7,
        detection_id=11,
        camera_id=3,
        watchlist_entry_id=5,
        timestamp=datetime(2026, 9, 28, 12, 30),
        latitude=28.61,
        longitude=77.2,
        confidence=0.96,
        severity="HIGH",
        status="OPEN",
        description="Watchlist match",
    )

    assert serialize_alert(alert) == {
        "id": 7,
        "detection_id": 11,
        "camera_id": 3,
        "watchlist_entry_id": 5,
        "timestamp": "2026-09-28T12:30:00",
        "latitude": 28.61,
        "longitude": 77.2,
        "confidence": 0.96,
        "severity": "HIGH",
        "status": "OPEN",
        "description": "Watchlist match",
    }


def test_detection_schema_rejects_invalid_confidence():
    with pytest.raises(ValueError):
        DetectionCreate(
            camera_id="CAM-001",
            timestamp=datetime.now(timezone.utc),
            confidence=1.1,
            event_type="ANPR",
        )