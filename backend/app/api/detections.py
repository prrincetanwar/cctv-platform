from datetime import datetime

from app.api.dependencies import require_roles
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session_dependency import get_db
from app.services.audit import record_audit
from app.models.alert import Alert
from app.models.detection import Detection
from app.repositories.alert import AlertRepository
from app.repositories.detection import DetectionRepository
from app.repositories.camera import CameraRepository
from app.repositories.watchlist import WatchlistRepository
from app.schemas.alert import AlertResponse
from app.schemas.detection import DetectionCreate
from app.websocket.manager import manager, serialize_alert

router = APIRouter(prefix="/api/detections", tags=["Detections"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_detection(payload: DetectionCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    camera = CameraRepository.get_by_camera_id(db, payload.camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    detection = Detection(
        camera_id=camera.id,
        timestamp=payload.timestamp,
        vehicle_number=payload.vehicle_number,
        confidence=payload.confidence,
        vehicle_type=payload.vehicle_type,
        bounding_box=payload.bounding_box,
        event_type=payload.event_type,
    )
    DetectionRepository.create(db, detection)

    alert = None
    if payload.vehicle_number:
        watchlist_entry = WatchlistRepository.get_by_identifier(db, payload.vehicle_number)
        if watchlist_entry and watchlist_entry.is_active:
            alert = Alert(
                detection_id=detection.id,
                camera_id=camera.id,
                watchlist_entry_id=watchlist_entry.id,
                timestamp=payload.timestamp,
                latitude=camera.latitude,
                longitude=camera.longitude,
                confidence=payload.confidence,
                severity=watchlist_entry.priority,
                status="OPEN",
                description=f"Watchlist match detected: {watchlist_entry.name}",
            )
            AlertRepository.create(db, alert)

    db.commit()
    db.refresh(detection)
    record_audit(db, user_id=current_user.id, action="DETECTION_CREATED", resource_type="DETECTION", resource_id=str(detection.id), description=f"Detection created for camera: {payload.camera_id}", details={"vehicle_number": payload.vehicle_number, "event_type": payload.event_type, "confidence": payload.confidence})
    db.commit()

    await manager.broadcast({
        "type": "DETECTION_CREATED",
        "detection": {
            "id": detection.id,
            "camera_id": payload.camera_id,
            "timestamp": detection.timestamp.isoformat(),
            "vehicle_number": detection.vehicle_number,
            "confidence": detection.confidence,
            "vehicle_type": detection.vehicle_type,
            "bounding_box": detection.bounding_box,
            "event_type": detection.event_type,
        },
        "alert": serialize_alert(alert) if alert else None,
    })

    return {
        "detection": {
            "id": detection.id,
            "camera_id": payload.camera_id,
            "timestamp": detection.timestamp,
            "vehicle_number": detection.vehicle_number,
            "confidence": detection.confidence,
            "vehicle_type": detection.vehicle_type,
            "bounding_box": detection.bounding_box,
            "event_type": detection.event_type,
        },
        "alert": {
            "id": alert.id,
            "status": alert.status,
            "severity": alert.severity,
            "description": alert.description,
        } if alert else None,
    }

@router.get("/search")
def search_detections(
    vehicle_number: str | None = None,
    event_type: str | None = None,
    camera_id: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    limit: int = Query(100, ge=1, le=500), current_user=Depends(require_roles("admin", "operator", "viewer")),
    db: Session = Depends(get_db),
):
    camera_db_id = None
    if camera_id:
        camera = CameraRepository.get_by_camera_id(db, camera_id)
        if not camera:
            return {"count": 0, "results": []}
        camera_db_id = camera.id

    detections = DetectionRepository.search(
        db,
        vehicle_number=vehicle_number,
        event_type=event_type,
        camera_id=camera_db_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
    )

    results = []
    for detection in detections:
        camera = CameraRepository.get_by_id(db, detection.camera_id)
        results.append({
            "id": detection.id,
            "camera_id": camera.camera_id if camera else None,
            "camera_name": camera.name if camera else None,
            "latitude": camera.latitude if camera else None,
            "longitude": camera.longitude if camera else None,
            "timestamp": detection.timestamp,
            "vehicle_number": detection.vehicle_number,
            "confidence": detection.confidence,
            "vehicle_type": detection.vehicle_type,
            "bounding_box": detection.bounding_box,
            "event_type": detection.event_type,
        })

    return {
        "count": len(results),
        "results": results,
    }

@router.get("/alerts", response_model=list[AlertResponse])
def list_alerts(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator", "viewer"))):
    return AlertRepository.list_all(db)


@router.patch("/alerts/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    alert = AlertRepository.get_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status != "OPEN":
        raise HTTPException(status_code=409, detail="Only open alerts can be acknowledged")
    alert.status = "ACKNOWLEDGED"
    db.commit()
    db.refresh(alert)
    record_audit(db, user_id=current_user.id, action="ALERT_ACKNOWLEDGED", resource_type="ALERT", resource_id=str(alert.id), description=f"Alert acknowledged: {alert.id}")
    db.commit()
    await manager.broadcast_alert_update(alert)
    return alert

@router.patch("/alerts/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(alert_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    alert = AlertRepository.get_by_id(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status != "ACKNOWLEDGED":
        raise HTTPException(status_code=409, detail="Only acknowledged alerts can be resolved")
    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    record_audit(db, user_id=current_user.id, action="ALERT_RESOLVED", resource_type="ALERT", resource_id=str(alert.id), description=f"Alert resolved: {alert.id}")
    db.commit()
    await manager.broadcast_alert_update(alert)
    return alert
