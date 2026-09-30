export interface Camera {
  id: number;
  camera_id: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  camera_type: string;
  source_protocol: string;
  stream_endpoint_reference: string;
  status: string;
  last_heartbeat: string | null;
  zone: string;
  storage_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Detection {
  id: number;
  camera_id: string;
  timestamp: string;
  vehicle_number: string | null;
  confidence: number;
  vehicle_type: string | null;
  bounding_box: Record<string, number> | null;
  event_type: string;
  created_at: string;
}

export interface Alert {
  id: number;
  detection_id: number;
  camera_id: string;
  watchlist_entry_id: number | null;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  confidence: number;
  severity: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistEntry {
  id: number;
  entity_type: string;
  entity_identifier: string;
  name: string;
  description: string | null;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}
