from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.cameras import router as cameras_router
from app.api.watchlist import router as watchlist_router
from app.api.detections import router as detections_router
from app.api.websocket import router as websocket_router
from app.api.audit import router as audit_router

app = FastAPI(
    title='okDriver Centralized CCTV Monitoring Platform',
    description='Centralized CCTV monitoring and AI-powered vehicle/entity detection platform.',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(cameras_router)
app.include_router(watchlist_router)
app.include_router(detections_router)
app.include_router(websocket_router)
app.include_router(audit_router)

@app.get('/health')
def health_check():
    return {
        'status': 'healthy',
        'service': 'okdriver-cctv-platform',
    }
