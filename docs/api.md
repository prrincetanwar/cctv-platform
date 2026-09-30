# API Surface

All routes except login and health require a bearer JWT unless noted.

## System and authentication

- `GET /health` returns service health.
- `POST /api/auth/login` authenticates a user.
- `GET /api/auth/me` returns the authenticated user.

## Cameras

- `GET /api/cameras` lists cameras with search, status, department, and zone filters.
- `POST /api/cameras` creates a camera for administrators/operators.
- `GET /api/cameras/{id}` returns a camera.
- `PUT /api/cameras/{id}` updates a camera.
- `DELETE /api/cameras/{id}` disables a camera.
- `POST /api/cameras/{id}/heartbeat` records an online heartbeat.
- `GET /api/cameras/stats/summary` returns camera and monitoring counts.

## Watchlist

- `GET /api/watchlist` lists vehicle/entity entries.
- `POST /api/watchlist` creates an entry.
- `GET /api/watchlist/{id}` returns an entry.
- `PUT /api/watchlist/{id}` updates an entry.
- `DELETE /api/watchlist/{id}` disables an entry.

## Detections and alerts

- `POST /api/detections` persists an analytics event and evaluates active watchlist matches.
- `GET /api/detections/search` searches by vehicle/entity, event type, camera, start time, and end time.
- `GET /api/detections/alerts` lists alerts.
- `PATCH /api/detections/alerts/{id}/acknowledge` moves OPEN to ACKNOWLEDGED.
- `PATCH /api/detections/alerts/{id}/resolve` moves ACKNOWLEDGED to RESOLVED.

## WebSocket

- `WS /ws/events?token={jwt}` streams `DETECTION_CREATED`, `CAMERA_HEALTH_CHANGED`, and `ALERT_UPDATED` events. The token is accepted only for an existing active user.

FastAPI also exposes generated OpenAPI documentation at `/docs` and `/redoc`.
