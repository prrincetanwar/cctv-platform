import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import type { Detection } from '../../services/api';
import 'leaflet/dist/leaflet.css';

interface DetectionMovementMapProps {
  detections: Detection[];
}

export default function DetectionMovementMap({ detections }: DetectionMovementMapProps) {
  const points = detections
    .filter(
      (d) =>
        Number.isFinite(d.latitude) &&
        Number.isFinite(d.longitude),
    )
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );

  if (points.length === 0) {
    return (
      <div className='map-empty'>
        No location data available for these detections.
      </div>
    );
  }

  const center: [number, number] = [
    points[0].latitude as number,
    points[0].longitude as number,
  ];

  const path = points.map(
    (p) =>
      [p.latitude as number, p.longitude as number] as [number, number],
  );

  return (
    <div className='movement-map'>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className='camera-map-container'
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{ color: '#2563eb', weight: 4 }}
          />
        )}

        {points.map((point, index) => (
          <CircleMarker
            key={point.id}
            center={[
              point.latitude as number,
              point.longitude as number,
            ]}
            radius={index === points.length - 1 ? 9 : 7}
            pathOptions={{
              color: '#1d4ed8',
              fillColor: '#3b82f6',
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className='camera-popup'>
                <strong>{point.vehicle_number || 'Entity detection'}</strong>
                <span>Camera: {point.camera_name || point.camera_id}</span>
                <span>Time: {new Date(point.timestamp).toLocaleString()}</span>
                <span>Type: {point.vehicle_type || 'Unknown'}</span>
                <span>
                  Confidence: {(point.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
