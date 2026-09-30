from app.api.dependencies import require_roles
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session_dependency import get_db
from app.services.audit import record_audit
from app.models.watchlist import WatchlistEntry
from app.repositories.watchlist import WatchlistRepository
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse, WatchlistUpdate

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
def create_watchlist_entry(payload: WatchlistCreate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    existing = WatchlistRepository.get_by_identifier(db, payload.entity_identifier)
    if existing:
        raise HTTPException(status_code=409, detail="Entity identifier already exists")
    entry = WatchlistEntry(**payload.model_dump())
    entry = WatchlistRepository.create(db, entry)
    record_audit(db, user_id=current_user.id, action="WATCHLIST_CREATED", resource_type="WATCHLIST", resource_id=str(entry.id), description=f"Watchlist entry created: {entry.entity_identifier}")
    db.commit()
    return entry

@router.get("", response_model=list[WatchlistResponse])
def list_watchlist(db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator", "viewer"))):
    return WatchlistRepository.list_all(db)

@router.get("/{entry_id}", response_model=WatchlistResponse)
def get_watchlist_entry(entry_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator", "viewer"))):
    entry = WatchlistRepository.get_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    return entry

@router.put("/{entry_id}", response_model=WatchlistResponse)
def update_watchlist_entry(entry_id: int, payload: WatchlistUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    entry = WatchlistRepository.get_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    if payload.entity_identifier and payload.entity_identifier != entry.entity_identifier:
        duplicate = WatchlistRepository.get_by_identifier(db, payload.entity_identifier)
        if duplicate:
            raise HTTPException(status_code=409, detail="Entity identifier already exists")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    record_audit(db, user_id=current_user.id, action="WATCHLIST_UPDATED", resource_type="WATCHLIST", resource_id=str(entry.id), description=f"Watchlist entry updated: {entry.entity_identifier}")
    db.commit()
    return entry

@router.delete("/{entry_id}", response_model=WatchlistResponse)
def disable_watchlist_entry(entry_id: int, db: Session = Depends(get_db), current_user=Depends(require_roles("admin", "operator"))):
    entry = WatchlistRepository.get_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    entry.is_active = False
    db.commit()
    db.refresh(entry)
    record_audit(db, user_id=current_user.id, action="WATCHLIST_DISABLED", resource_type="WATCHLIST", resource_id=str(entry.id), description=f"Watchlist entry disabled: {entry.entity_identifier}")
    db.commit()
    return entry
