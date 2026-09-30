import asyncio
import os
import websockets
from app.core.security import create_access_token

async def websocket_connection_check():
    token = create_access_token(1, "admin", "admin")
    url = f"ws://127.0.0.1:8000/ws/events?token={token}"
    async with websockets.connect(url) as ws:
        await ws.send("ping")
        return True

def test_websocket():
    assert asyncio.run(websocket_connection_check()) is True
