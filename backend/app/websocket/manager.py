from fastapi import WebSocket


def serialize_alert(alert) -> dict:
    return {
        "id": alert.id,
        "detection_id": alert.detection_id,
        "camera_id": alert.camera_id,
        "watchlist_entry_id": alert.watchlist_entry_id,
        "timestamp": alert.timestamp.isoformat(),
        "latitude": alert.latitude,
        "longitude": alert.longitude,
        "confidence": alert.confidence,
        "severity": alert.severity,
        "status": alert.status,
        "description": alert.description,
    }


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for websocket in list(self.active_connections):
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)

    async def broadcast_camera_health(self, camera):
        await self.broadcast({
            "type": "CAMERA_HEALTH_CHANGED",
            "camera": {
                "id": camera.id,
                "camera_id": camera.camera_id,
                "name": camera.name,
                "status": camera.status,
                "last_heartbeat": camera.last_heartbeat.isoformat() if camera.last_heartbeat else None,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
            },
        })

    async def broadcast_alert_update(self, alert):
        await self.broadcast({
            "type": "ALERT_UPDATED",
            "alert": serialize_alert(alert),
        })


manager = ConnectionManager()
