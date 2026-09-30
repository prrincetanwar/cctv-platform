# okDriver Centralized CCTV Monitoring Platform

A FastAPI, MySQL, React, and Leaflet prototype for centralized CCTV monitoring and AI-powered vehicle/entity detection.

## Implemented flow

Login -> camera registry -> camera monitoring/map -> detection simulation -> watchlist match -> alert -> WebSocket update -> acknowledgement -> resolution -> entity search and movement history -> audit log.

The prototype uses synthetic data such as `DL01AB1234`. Camera sources are explicitly labelled as simulated, locally recorded test streams, or protocol-ready references. It does not claim to connect to physical CCTV hardware. Selecting `RECORDED` with the default `sample://recorded-test` endpoint generates a short local browser recording; permitted MP4/WebM/OGG URLs are also supported.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, MySQL, JWT, WebSocket
- Frontend: React, TypeScript, Vite, Axios, React-Leaflet, Leaflet, Lucide React

## Local setup

1. Copy `.env.example` to `.env` and set a real database URL and JWT secret.
2. Install backend dependencies with `pip install -r requirements.txt`.
3. Apply migrations from `backend` with `alembic upgrade head`.
4. Start the API from `backend` with `uvicorn app.main:app --reload`.
5. Install frontend dependencies from `frontend` with `npm install`.
6. Start the frontend with `npm run dev`.

Create or provision an application user in the database before login; no production credentials are stored in this repository. The API validates active users for both HTTP and WebSocket access.

The API is available at `http://127.0.0.1:8000`; interactive API documentation is at `/docs`.

## Documentation

- [Architecture](docs/architecture.md)
- [API surface](docs/api.md)
- [Database and ER model](docs/database-er.md)
- [Scalability and deployment](docs/scalability-deployment.md)
- [Demo walkthrough](docs/demo.md)

## Limitations

This is a local prototype: RTSP/ONVIF/HLS/WebRTC adapters, distributed rate limiting, queues, Redis, GPU workers, and 80,000-camera operation are documented production considerations rather than provisioned features. FastAPI OpenAPI documentation is available at `/docs` and `/openapi.json`.
