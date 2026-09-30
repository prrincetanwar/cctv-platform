import { useEffect, useState } from 'react';
import { Activity, Camera as CameraIcon, Circle, Radio, Video } from 'lucide-react';
import type { Camera } from '../../services/api';

interface CameraFeedGridProps {
  cameras: Camera[];
}

function getProtocolLabel(camera: Camera) {
  const protocol = camera.source_protocol.toUpperCase();
  if (protocol === 'SIMULATED') return 'Simulated Feed';
  if (protocol === 'RECORDED') return 'Recorded Test Feed';
  if (protocol === 'RTSP') return 'RTSP Source';
  if (protocol === 'ONVIF') return 'ONVIF Source';
  if (protocol === 'HLS') return 'HLS Stream';
  if (protocol === 'WEBRTC') return 'WebRTC Stream';
  return protocol;
}

function isVideoUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\/.+/i.test(value) && /\.(mp4|webm|ogg)(\?.*)?$/i.test(value);
}

function SimulatedFeed({ camera }: { camera: Camera }) {
  return (
    <div className='simulated-feed'>
      <div className='feed-grid-lines' />
      <div className='feed-scan-line' />
      <div className='feed-corner top-left' />
      <div className='feed-corner top-right' />
      <div className='feed-corner bottom-left' />
      <div className='feed-corner bottom-right' />
      <div className='feed-overlay'>
        <span>LIVE SIMULATION</span>
        <strong>{camera.camera_id}</strong>
        <small>{camera.zone || 'Monitoring Zone'}</small>
      </div>
      <div className='feed-center-target'>
        <CameraIcon size={34} />
      </div>
    </div>
  );
}

function RecordedFallback() {
  return (
    <div className='recorded-feed-fallback'>
      <Video size={34} />
      <strong>NO RECORDED SIGNAL</strong>
      <span>Provide a playable MP4, WebM, or OGG source reference.</span>
    </div>
  );
}

function RecordedTestFeed() {
  const [source, setSource] = useState<string | null>(null);
  const supportsRecording = typeof MediaRecorder !== 'undefined'
    && typeof HTMLCanvasElement !== 'undefined'
    && 'captureStream' in HTMLCanvasElement.prototype;

  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    let timeout: number | undefined;
    let stream: MediaStream | undefined;
    let recorder: MediaRecorder | undefined;
    let objectUrl: string | undefined;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;

    if (!supportsRecording) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const startedAt = performance.now();
    const draw = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      context.fillStyle = '#101827';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#27415f';
      context.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
      context.fillStyle = '#d9e7f5';
      context.font = 'bold 24px sans-serif';
      context.fillText('RECORDED TEST SOURCE', 28, 48);
      context.font = '16px sans-serif';
      context.fillText('Synthetic local capture - not live CCTV', 28, 76);
      context.fillStyle = '#4fb3bf';
      context.beginPath();
      context.arc(120 + ((elapsed * 90) % 400), 210, 34, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#f3b562';
      context.fillRect(80 + ((elapsed * 55) % 430), 278, 120, 22);
      animationFrame = requestAnimationFrame(draw);
    };

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';
    const chunks: BlobPart[] = [];
    stream = canvas.captureStream(12);
    recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      setSource(objectUrl);
    };
    animationFrame = requestAnimationFrame(draw);
    recorder.start();
    timeout = window.setTimeout(() => recorder?.stop(), 4000);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [supportsRecording]);

  if (!supportsRecording) return <RecordedFallback />;
  if (!source) {
    return <div className='recorded-feed-fallback'><Video size={34} /><strong>CREATING RECORDED TEST FEED</strong><span>Generating a short local browser recording.</span></div>;
  }

  return <div className='video-feed'><video src={source} autoPlay muted loop playsInline controls /><div className='video-feed-label'>LOCALLY RECORDED TEST STREAM</div></div>;
}

function CameraFeed({ camera }: { camera: Camera }) {
  const endpoint = camera.stream_endpoint_reference;
  const protocol = camera.source_protocol.toUpperCase();

  if (protocol === 'RECORDED' && endpoint === 'sample://recorded-test') {
    return <RecordedTestFeed />;
  }

  if (protocol === 'RECORDED' && isVideoUrl(endpoint)) {
    return (
      <div className='video-feed'>
        <video src={endpoint || undefined} autoPlay muted loop playsInline controls />
        <div className='video-feed-label'>RECORDED TEST STREAM</div>
      </div>
    );
  }

  if (protocol === 'RECORDED') {
    return <RecordedFallback />;
  }

  if (protocol !== 'SIMULATED') {
    return (
      <div className='recorded-feed-fallback'>
        <Radio size={34} />
        <strong>{getProtocolLabel(camera).toUpperCase()}</strong>
        <span>Source reference configured; live adapter is not enabled in this prototype.</span>
      </div>
    );
  }

  return <SimulatedFeed camera={camera} />;
}

export default function CameraFeedGrid({ cameras }: CameraFeedGridProps) {
  if (cameras.length === 0) {
    return (
      <div className='empty-page'>
        <CameraIcon size={32} />
        <h3>No camera feeds available</h3>
        <span>Onboard a camera to add it to centralized monitoring.</span>
      </div>
    );
  }

  return (
    <div className='camera-feed-grid'>
      {cameras.map((camera) => (
        <article className='camera-feed-card' key={camera.id}>
          <div className='camera-feed-header'>
            <div>
              <strong>{camera.name}</strong>
              <span>{camera.camera_id}</span>
            </div>
            <span className={`status-pill ${camera.status.toLowerCase()}`}>
              <Circle size={8} fill='currentColor' />
              {camera.status}
            </span>
          </div>

          <CameraFeed camera={camera} />

          <div className='camera-feed-info'>
            <div>
              <Radio size={15} />
              <span>{getProtocolLabel(camera)}</span>
            </div>
            <div>
              <Activity size={15} />
              <span>{camera.department}</span>
            </div>
            <div>
              <Video size={15} />
              <span>{camera.zone || 'No zone assigned'}</span>
            </div>
          </div>

          <div className='camera-feed-endpoint'>
            <span>Source</span>
            <code>{camera.stream_endpoint_reference || 'Not configured'}</code>
          </div>
        </article>
      ))}
    </div>
  );
}
