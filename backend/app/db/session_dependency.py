from sqlalchemy.orm import Session
from app.db.session import engine

def get_db():
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()
