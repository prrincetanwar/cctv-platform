import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Car,
  Camera as CameraIcon,
  Clock,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';

import MainLayout from '../layouts/MainLayout';
import CameraMap from '../components/map/CameraMap';

import {
  createDetection,
  getAlerts,
  getCameraStats,
  getCameras,
  searchDetections,
} from '../services/api';

import type {
  Alert,
  Camera,
  CameraStats,
  Detection,
} from '../services/api';

import { connectEventSocket } from '../services/websocket';

interface EventMessage {
  type?: string;
  detection?: Detection;
  alert?: Alert;
}

function mergeAlert(current: Alert[], alert: Alert): Alert[] {
  const exists = current.some((item) => item.id === alert.id);
  return exists
    ? current.map((item) => (item.id === alert.id ? alert : item))
    : [alert, ...current];
}

export default function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);

  const [stats, setStats] = useState<CameraStats>({
    total: 0,
    online: 0,
    offline: 0,
    degraded: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [cameraSearch, setCameraSearch] = useState('');
  const [cameraStatus, setCameraStatus] = useState('');

  const loadDashboard = async () => {
    try {
      setError('');

      const [
        cameraData,
        alertData,
        detectionData,
        cameraStats,
      ] = await Promise.all([
        getCameras(),
        getAlerts(),
        searchDetections({ limit: 100 }),
        getCameraStats(),
      ]);

      setCameras(cameraData);
      setAlerts(alertData);
      setDetections(detectionData);
      setStats(cameraStats);
    } catch (err) {
      console.error(err);

      setError(
        'Unable to load monitoring data. Please log in again if your session has expired.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const socket = connectEventSocket((event: unknown) => {
      const message = event as EventMessage;

      if (message.type === 'DETECTION_CREATED') {
        const detection = message.detection;
        const alert = message.alert;

        if (detection) {
          setDetections((current) => {
            const exists = current.some(
              (item) => item.id === detection.id,
            );

            if (exists) {
              return current;
            }

            return [detection, ...current].slice(0, 100);
          });
        }

        if (alert) {
          setAlerts((current) => mergeAlert(current, alert));
        }
      }

      if (message.type === 'ALERT_UPDATED' && message.alert) {
        setAlerts((current) => mergeAlert(current, message.alert!));
      }

      if (message.type === 'CAMERA_HEALTH_CHANGED') {
        loadDashboard();
      }
    });

    return () => {
      socket?.close();
    };
  }, []);

  const simulateDetection = async () => {
    const camera =
      cameras.find((item) => item.status === 'ONLINE') ||
      cameras[0];

    if (!camera) {
      setError(
        'No camera is available for detection simulation.',
      );
      return;
    }

    try {
      setSimulating(true);
      setError('');

      await createDetection({
        camera_id: camera.camera_id,
        timestamp: new Date().toISOString(),
        vehicle_number: 'DL01AB1234',
        confidence: 0.96,
        vehicle_type: 'CAR',
        bounding_box: {
          x: 0.32,
          y: 0.28,
          width: 0.22,
          height: 0.18,
        },
        event_type: 'ANPR',
      });

      /*
       * The backend broadcasts the new detection and alert
       * through WebSocket. The dashboard will update automatically.
       */
    } catch (err) {
      console.error(err);

      setError(
        'Unable to create the simulated detection.',
      );
    } finally {
      setSimulating(false);
    }
  };

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === 'OPEN'),
    [alerts],
  );

  const onlineCount =
    stats.online ??
    cameras.filter(
      (camera) => camera.status === 'ONLINE',
    ).length;

  const filteredCameras = useMemo(() => {
    const query = cameraSearch.trim().toLowerCase();
    return cameras.filter((camera) => {
      const matchesSearch = !query || [camera.camera_id, camera.name, camera.department, camera.zone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
      const matchesStatus = !cameraStatus || camera.status === cameraStatus;
      return matchesSearch && matchesStatus;
    });
  }, [cameraSearch, cameraStatus, cameras]);

  const recentDetections = useMemo(
    () => [...detections].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8),
    [detections],
  );

  return (
    <MainLayout>
      <div className='page-header'>
        <div>
          <h1>Monitoring Dashboard</h1>

          <p>
            Centralized CCTV intelligence and real-time
            situational awareness
          </p>
        </div>

        <span className='live-badge'>
          <Activity size={15} />
          LIVE MONITORING
        </span>
      </div>

      {error && (
        <div className='error-banner'>
          {error}
        </div>
      )}

      <div className='stats-grid'>
        <div className='stat-card'>
          <div className='stat-icon blue'>
            <CameraIcon />
          </div>

          <div>
            <span>Total Cameras</span>
            <strong>
              {stats.total ?? cameras.length}
            </strong>

            <small>
              {onlineCount} active, {stats.offline ?? 0} offline, {stats.degraded ?? 0} degraded
            </small>
          </div>
        </div>

        <div className='stat-card'>
          <div className='stat-icon green'>
            <Activity />
          </div>

          <div>
            <span>Online Cameras</span>

            <strong>
              {onlineCount}
            </strong>

            <small>
              {stats.total
                ? (
                    (onlineCount / stats.total) *
                    100
                  ).toFixed(1)
                : 0}
              % availability
            </small>
          </div>
        </div>

        <div className='stat-card'>
          <div className='stat-icon red'>
            <AlertTriangle />
          </div>

          <div>
            <span>Active Alerts</span>

            <strong>
              {activeAlerts.length}
            </strong>

            <small>
              {activeAlerts.length
                ? 'Requires attention'
                : 'No open alerts'}
            </small>
          </div>
        </div>

        <div className='stat-card'>
          <div className='stat-icon orange'>
            <Car />
          </div>

          <div>
            <span>Detections</span>

            <strong>
              {detections.length}
            </strong>

            <small>
              Recorded analytics events
            </small>
          </div>
        </div>
      </div>

      <section className='panel'>
        <div className='panel-title'>
          <div>
            <h2>Live Camera Monitoring</h2>
            <span>
              Registered camera sources
            </span>
          </div>

          <div className='dashboard-actions'>
            <div className='search-field'>
              <Search size={15} />
              <input value={cameraSearch} onChange={(event) => setCameraSearch(event.target.value)} placeholder='Search cameras' />
            </div>
            <select value={cameraStatus} onChange={(event) => setCameraStatus(event.target.value)} aria-label='Filter cameras by status'>
              <option value=''>All statuses</option>
              <option value='ONLINE'>Online</option>
              <option value='OFFLINE'>Offline</option>
              <option value='DEGRADED'>Degraded</option>
            </select>
            {(cameraSearch || cameraStatus) && <button className='outline-button' onClick={() => { setCameraSearch(''); setCameraStatus(''); }}>Clear</button>}
            <button
              className='outline-button'
              onClick={simulateDetection}
              disabled={
                simulating ||
                cameras.length === 0
              }
            >
              <Activity size={14} />

              {simulating
                ? 'Sending...'
                : 'Simulate Detection'}
            </button>

            <button
              className='outline-button'
              onClick={loadDashboard}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className='empty-page'>
            <Activity size={28} />

            <h3>
              Loading monitoring data...
            </h3>
          </div>
        ) : (
          <div className='camera-grid'>
            {filteredCameras.length === 0 ? (
              <div className='empty-panel'><Search size={26} /><p>No cameras match the current filters.</p></div>
            ) : filteredCameras.map((camera) => (
              <div
                className='camera-card'
                key={camera.id}
              >
                <div className='camera-feed'>
                  <div className='feed-overlay'>
                    <span
                      className={
                        camera.status === 'ONLINE'
                          ? 'status-dot online'
                          : camera.status === 'DEGRADED'
                            ? 'status-dot degraded'
                            : 'status-dot offline'
                      }
                    />

                    {camera.status}
                  </div>

                  <div className='feed-center'>
                    <CameraIcon size={34} />

                    <strong>
                      {camera.camera_id}
                    </strong>

                    <small>
                      {camera.source_protocol} SOURCE
                    </small>
                  </div>

                  <span className='feed-time'>
                    <Clock size={12} />

                    {camera.status === 'ONLINE'
                      ? 'LIVE'
                      : 'NO SIGNAL'}
                  </span>
                </div>

                <div className='camera-info'>
                  <div>
                    <strong>
                      {camera.name}
                    </strong>

                    <span>
                      <MapPin size={13} />

                      {camera.zone ||
                        camera.department}
                    </span>
                  </div>

                  <span className='protocol-tag'>
                    {camera.source_protocol}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className='panel' style={{ marginTop: 15 }}>
        <div className='panel-title'>
          <div>
            <h2>Recent Detections</h2>
            <span>Latest analytics events received from the detection pipeline</span>
          </div>
        </div>
        {recentDetections.length === 0 ? (
          <div className='empty-panel'><Car size={26} /><p>No detections recorded yet.</p></div>
        ) : (
          <div className='table-wrap'>
            <table>
              <thead><tr><th>Time</th><th>Vehicle / Entity</th><th>Camera</th><th>Event</th><th>Confidence</th></tr></thead>
              <tbody>{recentDetections.map((detection) => <tr key={detection.id}><td>{new Date(detection.timestamp).toLocaleString()}</td><td><strong>{detection.vehicle_number || 'N/A'}</strong></td><td>{detection.camera_name || detection.camera_id}</td><td>{detection.event_type}</td><td>{(detection.confidence * 100).toFixed(1)}%</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <div className='dashboard-bottom'>
        <section className='panel alert-panel'>
          <div className='panel-title'>
            <div>
              <h2>Active Alerts</h2>

              <span>
                Watchlist matches requiring review
              </span>
            </div>
          </div>

          {activeAlerts.length === 0 ? (
            <div className='empty-page'>
              <Activity size={26} />

              <h3>
                No active alerts
              </h3>
            </div>
          ) : (
            activeAlerts
              .slice(0, 5)
              .map((alert) => (
                <div
                  className='alert-row'
                  key={alert.id}
                >
                  <div className='alert-icon'>
                    <AlertTriangle />
                  </div>

                  <div className='alert-main'>
                    <strong>
                      {alert.description ||
                        'Watchlist Match'}
                    </strong>

                    <span>
                      Camera ID: {alert.camera_id} -{' '}
                      {(
                        alert.confidence * 100
                      ).toFixed(1)}
                      % confidence
                    </span>

                    <small>
                      {new Date(
                        alert.timestamp,
                      ).toLocaleString()}
                    </small>
                  </div>

                  <span
                    className={
                      alert.severity.toLowerCase() ===
                      'high'
                        ? 'severity high'
                        : 'severity'
                    }
                  >
                    {alert.severity}
                  </span>
                </div>
              ))
          )}
        </section>

        <section className='panel map-panel'>
          <div className='panel-title'>
            <div>
              <h2>Camera Network</h2>

              <span>
                {cameras.length} registered locations
              </span>
            </div>
          </div>

          <CameraMap
            cameras={cameras}
            alerts={activeAlerts}
          />
        </section>
      </div>
    </MainLayout>
  );
}