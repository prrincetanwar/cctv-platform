from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.camera import Camera


class CameraRepository:
    @staticmethod
    def get_by_id(db: Session, camera_id: int) -> Camera | None:
        return db.get(Camera, camera_id)

    @staticmethod
    def get_by_camera_id(db: Session, camera_id: str) -> Camera | None:
        statement = select(Camera).where(Camera.camera_id == camera_id)
        return db.scalar(statement)

    @staticmethod
    def list_all(db: Session) -> list[Camera]:
        statement = select(Camera).order_by(Camera.id.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def create(db: Session, camera: Camera) -> Camera:
        db.add(camera)
        db.commit()
        db.refresh(camera)
        return camera

    @staticmethod
    def delete(db: Session, camera: Camera) -> None:
        db.delete(camera)
        db.commit()
