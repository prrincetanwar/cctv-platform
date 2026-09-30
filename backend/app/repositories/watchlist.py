from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.watchlist import WatchlistEntry

class WatchlistRepository:
    @staticmethod
    def get_by_id(db: Session, entry_id: int):
        return db.get(WatchlistEntry, entry_id)

    @staticmethod
    def get_by_identifier(db: Session, entity_identifier: str):
        statement = select(WatchlistEntry).where(WatchlistEntry.entity_identifier == entity_identifier)
        return db.scalar(statement)

    @staticmethod
    def list_all(db: Session):
        statement = select(WatchlistEntry).order_by(WatchlistEntry.id.desc())
        return list(db.scalars(statement).all())

    @staticmethod
    def create(db: Session, entry: WatchlistEntry):
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
