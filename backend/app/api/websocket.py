from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import engine
from app.models.user import User
from app.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", "0"))
        with Session(bind=engine) as db:
            user = db.scalar(select(User).where(User.id == user_id))
            if not user or not user.is_active:
                raise ValueError("Inactive or unknown user")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
