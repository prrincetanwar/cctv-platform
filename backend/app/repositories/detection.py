from sqlalchemy.orm import Session
from app.models.detection import Detection

class DetectionRepository:
    @staticmethod
    def create(db: Session, detection: Detection):
        db.add(detection)
        db.flush()
        return detection


    @staticmethod
    def search(db: Session, vehicle_number=None, event_type=None, camera_id=None, start_time=None, end_time=None, limit=100):
        from sqlalchemy import select
        statement = select(Detection).order_by(Detection.timestamp.desc()).limit(limit)
        if vehicle_number:
            statement = statement.where(Detection.vehicle_number == vehicle_number)
        if event_type:
            statement = statement.where(Detection.event_type == event_type)
        if camera_id:
            statement = statement.where(Detection.camera_id == camera_id)
        if start_time:
            statement = statement.where(Detection.timestamp >= start_time)
        if end_time:
            statement = statement.where(Detection.timestamp <= end_time)
        return list(db.scalars(statement).all())
