# Database and ER Model

The schema is managed with Alembic migrations in `backend/alembic/versions`.

```mermaid
erDiagram
    USER ||--o{ AUDIT_LOG : creates
    CAMERA ||--o{ DETECTION : records
    DETECTION ||--o{ ALERT : produces
    WATCHLIST_ENTRY ||--o{ ALERT : matches
    CAMERA ||--o{ ALERT : locates

    USER { int id string username string role }
    CAMERA { int id string camera_id string status decimal latitude decimal longitude }
    DETECTION { int id int camera_db_id datetime timestamp string vehicle_number decimal confidence string event_type }
    WATCHLIST_ENTRY { int id string entity_type string entity_identifier string priority boolean is_active }
    ALERT { int id int detection_id int camera_id int watchlist_entry_id datetime timestamp string severity string status }
    AUDIT_LOG { int id int user_id string action string resource_type string resource_id datetime created_at }
```

Camera and watchlist identifiers are indexed. Detection searches are ordered by timestamp and scoped by optional camera, event, entity, and time filters. Alert status and watchlist activity are persisted fields rather than frontend-only state.

Historical migrations must not be rewritten. Any future schema change should be a new Alembic revision that preserves existing data.
