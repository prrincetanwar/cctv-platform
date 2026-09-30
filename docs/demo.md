# Demo Walkthrough

1. Start MySQL, apply migrations, start FastAPI, and start the Vite frontend.
2. Log in with an application user configured in the database; this repository does not create a production or hard-coded demo password.
3. Open Cameras and add synthetic cameras with `SIMULATED` and `RECORDED` sources. Leave the recorded endpoint as `sample://recorded-test` to generate the local recorded test stream, or provide a permitted playable MP4/WebM/OGG URL.
4. Open Watchlist and create an active vehicle entry with identifier `DL01AB1234`, name `Synthetic Stolen Vehicle`, and HIGH priority.
5. Return to the Dashboard and choose Simulate Detection.
6. Confirm the detection and OPEN watchlist alert appear in the dashboard and Alerts page without a manual refresh.
7. Acknowledge the alert, then resolve it. The API enforces the OPEN -> ACKNOWLEDGED -> RESOLVED order.
8. Open Entity Search and search `DL01AB1234`; optionally set From and To timestamps to show filtered history and the movement map.
9. Open the API docs at `http://127.0.0.1:8000/docs` to demonstrate the protected endpoints and WebSocket route.

All demonstration identifiers and events are synthetic. Do not enter real personal data or production credentials.
