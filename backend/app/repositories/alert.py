from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.alert import Alert

class AlertRepository:
    @staticmethod
    def create(db: Session, alert: Alert):
        db.add(alert)
        db.flush()
        return alert

    @staticmethod
    def get_by_id(db: Session, alert_id: int):
        return db.get(Alert, alert_id)

    @staticmethod
    def list_all(db: Session):
        statement = select(Alert).order_by(Alert.id.desc())
        return list(db.scalars(statement).all())
