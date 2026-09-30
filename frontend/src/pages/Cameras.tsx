import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Camera as CameraIcon,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldOff,
  X,
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import CameraFeedGrid from '../components/camera/CameraFeedGrid';
import {
  createCamera,
  disableCamera,
  getCameras,
  sendCameraHeartbeat,
  updateCamera
} from '../services/api';

import type {
  Camera,
} from '../services/api';

type CameraForm = {
  camera_id: string;
  name: string;
  department: string;
  latitude: string;
  longitude: string;
  camera_type: string;
  source_protocol: string;
  stream_endpoint_reference: string;
  zone: string;
  status: string;
};

const emptyForm: CameraForm = {
  camera_id: '',
  name: '',
  department: '',
  latitude: '0',
  longitude: '0',
  camera_type: 'CCTV',
  source_protocol: 'SIMULATED',
  stream_endpoint_reference: 'sample://',
  zone: '',
  status: 'OFFLINE',
};

export default function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Camera | null>(null);
  const [form, setForm] = useState<CameraForm>(emptyForm);

  const loadCameras = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getCameras({
        search: search || undefined,
        status: status || undefined,
        department: department || undefined,
      });

      setCameras(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load cameras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, [status, department]);

  const departments = useMemo(
    () => Array.from(new Set(cameras.map((camera) => camera.department))).sort(),
    [cameras],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEdit = (camera: Camera) => {
    setEditing(camera);
    setForm({
      camera_id: camera.camera_id,
      name: camera.name,
      department: camera.department,
      latitude: String(camera.latitude),
      longitude: String(camera.longitude),
      camera_type: camera.camera_type,
      source_protocol: camera.source_protocol,
      stream_endpoint_reference:
        camera.stream_endpoint_reference || '',
      zone: camera.zone || '',
      status: camera.status,
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const updateField = (
    field: keyof CameraForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setError('');
      setSuccess('');

      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };

      if (editing) {
        await updateCamera(editing.id, payload);
        setSuccess('Camera updated successfully.');
      } else {
        await createCamera(payload);
        setSuccess('Camera onboarded successfully.');
      }

      setShowForm(false);
      await loadCameras();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          'Unable to save camera.',
      );
    }
  };

  const handleDisable = async (camera: Camera) => {
    if (
      !window.confirm(
        `Disable camera ${camera.camera_id}?`,
      )
    ) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await disableCamera(camera.id);
      setSuccess(`${camera.camera_id} disabled.`);
      await loadCameras();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          'Unable to disable camera.',
      );
    }
  };

  const handleHeartbeat = async (camera: Camera) => {
    try {
      setError('');
      await sendCameraHeartbeat(camera.id);
      setSuccess(`${camera.camera_id} heartbeat received.`);
      await loadCameras();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          'Unable to update heartbeat.',
      );
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h1>Camera Management</h1>
          <p>
            Register, monitor and manage centralized CCTV
            sources.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreate}
        >
          <Plus size={16} />
          Add Camera
        </button>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      {success && (
        <div className="success-banner">{success}</div>
      )}

      <section className="panel">
        <div className="camera-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  loadCameras();
                }
              }}
              placeholder="Search camera ID or name"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="">All statuses</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="DEGRADED">Degraded</option>
          </select>

          <select
            value={department}
            onChange={(event) =>
              setDepartment(event.target.value)
            }
          >
            <option value="">All departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            className="outline-button"
            onClick={loadCameras}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-page">
            <Activity size={28} />
            <h3>Loading cameras...</h3>
          </div>
        ) : cameras.length === 0 ? (
          <div className="empty-page">
            <CameraIcon size={32} />
            <h3>No cameras found</h3>
            <span>
              Try another filter or onboard a new camera.
            </span>
          </div>
        ) : (
          <>
          <section className="monitoring-section"><div className="section-heading"><div><h2>Live Camera Monitoring</h2><p>Centralized near-live view of registered camera sources.</p></div></div><CameraFeedGrid cameras={cameras} /></section>

          <div className="camera-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Camera</th>
                  <th>Department</th>
                  <th>Source</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Heartbeat</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {cameras.map((camera) => (
                  <tr key={camera.id}>
                    <td>
                      <strong>{camera.name}</strong>
                      <small>{camera.camera_id}</small>
                    </td>

                    <td>{camera.department}</td>

                    <td>
                      <span className="protocol-tag">
                        {camera.source_protocol}
                      </span>
                    </td>

                    <td>
                      <div className="location-cell">
                        <MapPin size={14} />
                        {camera.zone ||
                          `${camera.latitude}, ${camera.longitude}`}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-pill ${camera.status.toLowerCase()}`}
                      >
                        <span className="status-dot" />
                        {camera.status}
                      </span>
                    </td>

                    <td>
                      {camera.last_heartbeat
                        ? new Date(
                            camera.last_heartbeat,
                          ).toLocaleString()
                        : 'Never'}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-action"
                          title="Edit camera"
                          onClick={() =>
                            openEdit(camera)
                          }
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          className="icon-action"
                          title="Send heartbeat"
                          onClick={() =>
                            handleHeartbeat(camera)
                          }
                        >
                          <Activity size={15} />
                        </button>

                        <button
                          className="icon-action danger"
                          title="Disable camera"
                          onClick={() =>
                            handleDisable(camera)
                          }
                        >
                          <ShieldOff size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowForm(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  {editing
                    ? 'Edit Camera'
                    : 'Onboard Camera'}
                </h2>
                <span>
                  Configure the CCTV source and health
                  information.
                </span>
              </div>

              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="camera-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <label>
                  Camera ID
                  <input
                    value={form.camera_id}
                    onChange={(event) =>
                      updateField(
                        'camera_id',
                        event.target.value,
                      )
                    }
                    disabled={Boolean(editing)}
                    required
                  />
                </label>

                <label>
                  Camera Name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        'name',
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Department
                  <input
                    value={form.department}
                    onChange={(event) =>
                      updateField(
                        'department',
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Zone
                  <input
                    value={form.zone}
                    onChange={(event) =>
                      updateField(
                        'zone',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) =>
                      updateField(
                        'latitude',
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) =>
                      updateField(
                        'longitude',
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Camera Type
                  <input
                    value={form.camera_type}
                    onChange={(event) =>
                      updateField(
                        'camera_type',
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Source Protocol
                  <select
                    value={form.source_protocol}
                    onChange={(event) => {
                      const protocol = event.target.value;
                      updateField('source_protocol', protocol);
                      if (protocol === 'RECORDED' && !form.stream_endpoint_reference.startsWith('http')) {
                        updateField('stream_endpoint_reference', 'sample://recorded-test');
                      }
                    }}
                  >
                    <option value="SIMULATED">
                      SIMULATED
                    </option>
                    <option value="RECORDED">
                      RECORDED
                    </option>
                    <option value="RTSP">RTSP</option>
                    <option value="ONVIF">ONVIF</option>
                    <option value="HLS">HLS</option>
                    <option value="WEBRTC">
                      WEBRTC
                    </option>
                  </select>
                </label>

                <label className="full-width">
                  Stream Endpoint Reference
                  <input
                    value={
                      form.stream_endpoint_reference
                    }
                    onChange={(event) =>
                      updateField(
                        'stream_endpoint_reference',
                        event.target.value,
                      )
                    }
                    placeholder="sample://traffic/main-gate"
                    required
                  />
                </label>

                <label>
                  Initial Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        'status',
                        event.target.value,
                      )
                    }
                  >
                    <option value="ONLINE">
                      ONLINE
                    </option>
                    <option value="OFFLINE">
                      OFFLINE
                    </option>
                    <option value="DEGRADED">
                      DEGRADED
                    </option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editing
                    ? 'Update Camera'
                    : 'Onboard Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}