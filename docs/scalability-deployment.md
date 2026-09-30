# Scalability and Deployment

The current application is a prototype and is not intended to operate 80,000 cameras in one process or database. The production architecture below describes how the same contracts could scale without claiming that this repository provisions that infrastructure.

## Scale-out design

- Run multiple stateless FastAPI instances behind a load balancer.
- Terminate TLS at the edge and use secure internal service networking.
- Partition camera ownership and analytics by region so local processing reduces WAN bandwidth.
- Use edge gateways for stream normalization and first-pass detection where latency or bandwidth requires it.
- Move detection ingestion and WebSocket fan-out to durable message queues for burst absorption.
- Use Redis or an equivalent shared presence/cache layer when multiple WebSocket workers are deployed.
- Add composite database indexes for the production query mix, and partition high-volume detections by time or region.
- Use GPU/accelerator pools for production analytics while retaining the current API event contract.

For approximately 80,000 cameras, the intended flow is: camera sources -> regional/edge gateways -> stream adapters -> load-balanced ingestion -> queue/event bus -> detection workers -> watchlist and alert engine -> MySQL-compatible scalable storage -> Redis/shared state -> WebSocket delivery -> React monitoring clients. Regional processing, edge inference, bandwidth-aware stream normalization, horizontal API/worker scaling, partitioned detection tables, indexes, and cache-backed reads are central to that design.

## Storage and operations

- Keep recent detections in hot relational storage.
- Move video and older event payloads to tiered object storage with retention policies.
- Optimize streams through regional encoding, thumbnails, and bandwidth-aware delivery.
- Monitor API latency, database health, queue depth, camera heartbeat age, WebSocket connections, and detection throughput.
- Deploy across availability zones with automated backups, tested restore procedures, and disaster recovery runbooks.
- Segment camera, analytics, database, and operator networks; apply least-privilege credentials, audit logging, patching, and secrets management.

Production planning should also cover high availability across zones, disaster recovery and restore drills, GPU capacity, storage retention tiers, cost controls, queue backpressure, secret rotation, network segmentation, cybersecurity monitoring, and operational alerting.

Rate limiting is not included in this local prototype. Production deployments should apply gateway or service-level limits to login and high-volume ingestion, with distributed counters where multiple API instances are used.

The prototype does not provision Kafka, Redis, GPU infrastructure, or a multi-region cluster because the assignment permits architectural documentation for these concerns.
