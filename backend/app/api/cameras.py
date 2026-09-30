from app.api.dependencies import require_roles, get_current_user
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.session_dependency import get_db
from app.services.audit import record_audit
from app.websocket.manager import manager
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.detection import Detection
from app.models.watchlist import WatchlistEntry
from app.repositories.camera import CameraRepository
from app.schemas.camera import CameraCreate, CameraResponse, CameraUpdate

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])


@router.post("", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    existing = CameraRepository.get_by_camera_id(db, payload.camera_id)
    if existing:
        raise HTTPException(status_code=409, detail="Camera ID already exists")
    camera = Camera(**payload.model_dump())
    camera = CameraRepository.create(db, camera)
    record_audit(db, user_id=current_user.id, action="CAMERA_CREATED", resource_type="CAMERA", resource_id=str(camera.id), description=f"Camera created: {camera.camera_id}", details={"camera_id": camera.camera_id, "name": camera.name})
    db.commit()
    return camera


@router.get("/stats/summary")
def camera_stats_summary(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator", "viewer"))):
    cameras = CameraRepository.list_all(db)
    total_cameras = len(cameras)
    online_cameras = sum(1 for camera in cameras if camera.status == "ONLINE")
    offline_cameras = sum(1 for camera in cameras if camera.status == "OFFLINE")
    degraded_cameras = sum(1 for camera in cameras if camera.status == "DEGRADED")
    total_detections = db.scalar(select(func.count(Detection.id))) or 0
    open_alerts = db.scalar(select(func.count(Alert.id)).where(Alert.status == "OPEN")) or 0
    acknowledged_alerts = db.scalar(select(func.count(Alert.id)).where(Alert.status == "ACKNOWLEDGED")) or 0
    resolved_alerts = db.scalar(select(func.count(Alert.id)).where(Alert.status == "RESOLVED")) or 0
    active_watchlist_entries = db.scalar(select(func.count(WatchlistEntry.id)).where(WatchlistEntry.is_active == True)) or 0
    return {
        "cameras": {
            "total": total_cameras,
            "online": online_cameras,
            "offline": offline_cameras,
            "degraded": degraded_cameras,
        },
        "detections": {
            "total": total_detections,
        },
        "alerts": {
            "open": open_alerts,
            "acknowledged": acknowledged_alerts,
            "resolved": resolved_alerts,
        },
        "watchlist": {
            "active": active_watchlist_entries,
        },
    }


@router.get("", response_model=list[CameraResponse])
def list_cameras(
    search: str | None = Query(None, min_length=1, max_length=100),
    status_filter: str | None = Query(None, alias="status", max_length=30),
    department: str | None = Query(None, max_length=100),
    zone: str | None = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("admin", "operator", "viewer")),
):
    statement = select(Camera).order_by(Camera.id.desc())
    if search:
        pattern = f"%{search}%"
        statement = statement.where(or_(Camera.camera_id.like(pattern), Camera.name.like(pattern)))
    if status_filter:
        statement = statement.where(Camera.status == status_filter.upper())
    if department:
        statement = statement.where(Camera.department == department)
    if zone:
        statement = statement.where(Camera.zone == zone)
    return list(db.scalars(statement).all())


@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator", "viewer"))):
    camera = CameraRepository.get_by_id(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.put("/{camera_id}", response_model=CameraResponse)
def update_camera(camera_id: int, payload: CameraUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    camera = CameraRepository.get_by_id(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    if payload.camera_id and payload.camera_id != camera.camera_id:
        duplicate = CameraRepository.get_by_camera_id(db, payload.camera_id)
        if duplicate:
            raise HTTPException(status_code=409, detail="Camera ID already exists")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(camera, field, value)
    db.commit()
    db.refresh(camera)
    record_audit(db, user_id=current_user.id, action="CAMERA_UPDATED", resource_type="CAMERA", resource_id=str(camera.id), description=f"Camera updated: {camera.camera_id}", details={"camera_id": camera.camera_id, "name": camera.name})
    db.commit()
    return camera


@router.delete("/{camera_id}", response_model=CameraResponse)
def disable_camera(camera_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    camera = CameraRepository.get_by_id(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.status = "OFFLINE"
    db.commit()
    db.refresh(camera)
    record_audit(db, user_id=current_user.id, action="CAMERA_DISABLED", resource_type="CAMERA", resource_id=str(camera.id), description=f"Camera disabled: {camera.camera_id}")
    db.commit()
    return camera


@router.post("/{camera_id}/heartbeat", response_model=CameraResponse)
async def camera_heartbeat(camera_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    camera = CameraRepository.get_by_id(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera.last_heartbeat = datetime.utcnow()
    camera.status = "ONLINE"
    db.commit()
    db.refresh(camera)
    record_audit(db, user_id=current_user.id, action="CAMERA_HEARTBEAT", resource_type="CAMERA", resource_id=str(camera.id), description=f"Camera heartbeat: {camera.camera_id}", details={"status": camera.status})
    db.commit()
    await manager.broadcast_camera_health(camera)
    return camera
