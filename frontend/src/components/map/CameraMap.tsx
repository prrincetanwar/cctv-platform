import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { Camera, Alert } from '../../services/api';
import 'leaflet/dist/leaflet.css';

const onlineIcon = new L.DivIcon({
  className: 'camera-marker camera-marker-online',
  html: '<span>O</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const offlineIcon = new L.DivIcon({
  className: 'camera-marker camera-marker-offline',
  html: '<span>O</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const degradedIcon = new L.DivIcon({
  className: 'camera-marker camera-marker-degraded',
  html: '<span>O</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const alertIcon = new L.DivIcon({
  className: 'camera-marker camera-marker-alert',
  html: '<span>!</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function getCameraIcon(status: string, hasAlert: boolean) {
  if (hasAlert) return alertIcon;
  if (status === 'ONLINE') return onlineIcon;
  if (status === 'DEGRADED') return degradedIcon;
  return offlineIcon;
}

export default function CameraMap({
  cameras,
  alerts = [],
}: {
  cameras: Camera[];
  alerts?: Alert[];
}) {
  const validCameras = cameras.filter(
    (camera) =>
      Number.isFinite(camera.latitude) &&
      Number.isFinite(camera.longitude),
  );

  if (validCameras.length === 0) {
    return <div className="map-empty">No camera locations available.</div>;
  }

  const center: [number, number] = [
    validCameras[0].latitude,
    validCameras[0].longitude,
  ];

  const openAlerts = alerts.filter((alert) => alert.status === 'OPEN');

  const alertCameraIds = new Set(
    openAlerts.map((alert) => alert.camera_id),
  );

  return (
    <div className="camera-map">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="camera-map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validCameras.map((camera) => {
          const hasAlert = alertCameraIds.has(camera.id);

          const cameraAlerts = openAlerts.filter(
            (alert) => alert.camera_id === camera.id,
          );

          return (
            <Marker
              key={camera.id}
              position={[camera.latitude, camera.longitude]}
              icon={getCameraIcon(camera.status, hasAlert)}
            >
              <Popup>
                <div className="camera-popup">
                  <strong>{camera.name}</strong>

                  <span>{camera.camera_id}</span>

                  <span>
                    Department: {camera.department}
                  </span>

                  <span>
                    Zone: {camera.zone || 'N/A'}
                  </span>

                  <span>
                    Status: {camera.status}
                  </span>

                  {cameraAlerts.length > 0 && (
                    <>
                      <strong className="popup-alert">
                        OPEN ALERT
                      </strong>

                      {cameraAlerts.slice(0, 3).map((alert) => (
                        <span key={alert.id}>
                          {alert.severity}:{' '}
                          {alert.description || 'Watchlist match'}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}