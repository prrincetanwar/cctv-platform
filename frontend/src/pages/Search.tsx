import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Search as SearchIcon, MapPin, Clock, Car, RefreshCw } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import DetectionMovementMap from '../components/map/DetectionMovementMap';
import { searchDetections } from '../services/api';
import type { Detection } from '../services/api';

export default function Search() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [eventType, setEventType] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const orderedDetections = useMemo(() => [...detections].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [detections]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const results = await searchDetections({ vehicle_number: vehicleNumber.trim() || undefined, event_type: eventType || undefined, camera_id: cameraId.trim() || undefined, start_time: startTime ? new Date(startTime).toISOString() : undefined, end_time: endTime ? new Date(endTime).toISOString() : undefined, limit: 100 });
      setDetections(results);
      setSearched(true);
    } catch {
      setError('Unable to load detection history.');
      setDetections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVehicleNumber('');
    setEventType('');
    setCameraId('');
    setStartTime('');
    setEndTime('');
    setDetections([]);
    setSearched(false);
    setError('');
  };

  return (
    <MainLayout>
      <div className='page-header'>
        <div><h1>Vehicle & Entity Search</h1><p>Search detections and review entity movement history.</p></div>
      </div>
      <section className='panel'>
        <div className='section-heading'><div><h2>Detection Search</h2><p>Search historical AI detection events.</p></div></div>
        <form className='search-form' onSubmit={handleSearch}>
          <label>Vehicle / Entity ID<input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder='e.g. DL01AB1234' /></label>
          <label>Event Type<select value={eventType} onChange={(e) => setEventType(e.target.value)}><option value=''>All events</option><option value='ANPR'>ANPR</option><option value='VEHICLE'>Vehicle</option><option value='PERSON'>Person</option></select></label>
          <label>Camera ID<input value={cameraId} onChange={(e) => setCameraId(e.target.value)} placeholder='e.g. CAM-001' /></label>
          <label>From<input type='datetime-local' value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
          <label>To<input type='datetime-local' value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
          <div className='search-actions'><button className='primary-button' type='submit' disabled={loading}><SearchIcon size={17} />{loading ? 'Searching...' : 'Search'}</button><button className='secondary-button' type='button' onClick={handleReset} disabled={loading}><RefreshCw size={17} />Reset</button></div>
        </form>
        {error && <div className='error-banner'>{error}</div>}
      </section>
      {searched && (<>
        <section className='search-summary'>
          <div className='stat-card'><Car size={20} /><div><span>Detections</span><strong>{detections.length}</strong></div></div>
          <div className='stat-card'><MapPin size={20} /><div><span>Mapped Events</span><strong>{detections.filter((d) => Number.isFinite(d.latitude) && Number.isFinite(d.longitude)).length}</strong></div></div>
          <div className='stat-card'><Clock size={20} /><div><span>History Range</span><strong>{orderedDetections.length > 1 ? 'Multiple events' : 'Single event'}</strong></div></div>
        </section>
        <section className='panel'>
          <div className='section-heading'><div><h2>Movement History</h2><p>Chronological detection locations connected across cameras.</p></div></div>
          <DetectionMovementMap detections={detections} />
        </section>
        <section className='panel'>
          <div className='section-heading'><div><h2>Detection History</h2><p>{detections.length} detection(s) found.</p></div></div>
          {detections.length === 0 ? <div className='empty-panel'><p>No detections matched the selected filters.</p></div> : <div className='table-wrap'><table><thead><tr><th>Time</th><th>Vehicle / Entity</th><th>Camera</th><th>Event</th><th>Vehicle Type</th><th>Confidence</th></tr></thead><tbody>{[...detections].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((detection) => <tr key={detection.id}><td>{new Date(detection.timestamp).toLocaleString()}</td><td><strong>{detection.vehicle_number || 'N/A'}</strong></td><td>{detection.camera_name || detection.camera_id}</td><td>{detection.event_type}</td><td>{detection.vehicle_type || 'Unknown'}</td><td>{(detection.confidence * 100).toFixed(1)}%</td></tr>)}</tbody></table></div>}
        </section>
      </>)}
    </MainLayout>
  );
}
