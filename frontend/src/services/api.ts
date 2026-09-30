import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

export interface Camera {
  id: number;
  camera_id: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  camera_type: string;
  source_protocol: string;
  stream_endpoint_reference?: string | null;
  status: string;
  last_heartbeat?: string | null;
  zone?: string | null;
  storage_metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface CameraCreatePayload {
  camera_id: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  camera_type: string;
  source_protocol: string;
  stream_endpoint_reference?: string;
  status?: string;
  zone?: string;
  storage_metadata?: Record<string, unknown>;
}

export interface CameraUpdatePayload {
  camera_id?: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  camera_type: string;
  source_protocol: string;
  stream_endpoint_reference?: string;
  status?: string;
  zone?: string;
  storage_metadata?: Record<string, unknown>;
}

export interface CameraStats {
  total: number;
  online: number;
  offline: number;
  degraded: number;
  [key: string]: number;
}

export interface WatchlistEntry {
  id: number;
  entity_type: string;
  entity_identifier: string;
  name: string;
  description?: string | null;
  priority: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WatchlistCreatePayload {
  entity_type: string;
  entity_identifier: string;
  name: string;
  description?: string;
  priority: string;
  is_active?: boolean;
}

export interface WatchlistUpdatePayload {
  entity_type?: string;
  entity_identifier?: string;
  name?: string;
  description?: string;
  priority?: string;
  is_active?: boolean;
}

export interface Detection {
  id: number;
  camera_id: string;
  camera_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: string;
  vehicle_number?: string | null;
  confidence: number;
  vehicle_type?: string | null;
  bounding_box?: Record<string, unknown> | null;
  event_type: string;
}

export interface Alert {
  id: number;
  detection_id: number;
  camera_id: number;
  watchlist_entry_id?: number | null;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  confidence: number;
  severity: string;
  status: string;
  description?: string | null;
}

export async function getCameras(
  params?: {
    search?: string;
    status?: string;
    department?: string;
    zone?: string;
  },
): Promise<Camera[]> {
  const response = await api.get<Camera[]>('/api/cameras', { params });
  return response.data;
}

export async function getCameraStats(): Promise<CameraStats> {
  const response = await api.get('/api/cameras/stats/summary');
  const data = response.data as any;
  return {
    total: data.cameras.total,
    online: data.cameras.online,
    offline: data.cameras.offline,
    degraded: data.cameras.degraded,
  };
}

export async function createCamera(
  payload: CameraCreatePayload,
): Promise<Camera> {
  const response = await api.post<Camera>(
    '/api/cameras',
    payload,
  );

  return response.data;
}

export async function updateCamera(
  id: number,
  payload: CameraUpdatePayload,
): Promise<Camera> {
  const response = await api.put<Camera>(
    `/api/cameras/${id}`,
    payload,
  );

  return response.data;
}

export async function disableCamera(
  id: number,
): Promise<Camera> {
  const response = await api.delete<Camera>(
    `/api/cameras/${id}`,
  );

  return response.data;
}

export async function sendCameraHeartbeat(
  id: number,
): Promise<Camera> {
  const response = await api.post<Camera>(
    `/api/cameras/${id}/heartbeat`,
  );

  return response.data;
}

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  const response = await api.get<WatchlistEntry[]>(
    '/api/watchlist',
  );

  return response.data;
}

export async function createWatchlistEntry(
  payload: WatchlistCreatePayload,
): Promise<WatchlistEntry> {
  const response = await api.post<WatchlistEntry>('/api/watchlist', payload);
  return response.data;
}

export async function updateWatchlistEntry(
  id: number,
  payload: WatchlistUpdatePayload,
): Promise<WatchlistEntry> {
  const response = await api.put<WatchlistEntry>(`/api/watchlist/${id}`, payload);
  return response.data;
}

export async function disableWatchlistEntry(
  id: number,
): Promise<WatchlistEntry> {
  const response = await api.delete<WatchlistEntry>(`/api/watchlist/${id}`);
  return response.data;
}

export async function searchDetections(
  params?: {
    vehicle_number?: string;
    event_type?: string;
    camera_id?: string;
    start_time?: string;
    end_time?: string;
    limit?: number;
  },
): Promise<Detection[]> {
  const response = await api.get<{ count: number; results: Detection[] }>(
    '/api/detections/search',
    { params },
  );
  return response.data.results;
}

export interface DetectionCreatePayload {

  camera_id: string;

  timestamp: string;

  vehicle_number?: string;

  confidence: number;

  vehicle_type?: string;

  bounding_box?: Record<string, unknown>;

  event_type: string;

}



export async function createDetection(

  payload: DetectionCreatePayload,

): Promise<unknown> {

  const response = await api.post('/api/detections', payload);

  return response.data;

}



export async function getAlerts(): Promise<Alert[]> {
  const response = await api.get<Alert[]>(
    '/api/detections/alerts',
  );

  return response.data;
}

export default api;

