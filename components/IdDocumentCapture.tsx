'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, RefreshCw } from 'lucide-react';

type IdDocumentCaptureProps = {
  username: string;
  language: 'en' | 'zh' | 'ms';
  onComplete: (fileName: string) => void;
  labels: {
    title: string;
    front: string;
    back: string;
    capture: string;
    retake: string;
    submit: string;
    ready: string;
    needBoth: string;
    working: string;
    choosePhoto: string;
    cameraUnavailable: string;
    photoError: string;
  };
};

type CaptureSide = 'front' | 'back';

export function IdDocumentCapture({ username, onComplete, labels }: IdDocumentCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [side, setSide] = useState<CaptureSide>('front');
  const [frontBlob, setFrontBlob] = useState<Blob | null>(null);
  const [backBlob, setBackBlob] = useState<Blob | null>(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(labels.cameraUnavailable);
        return;
      }

      try {
        const constraints: MediaStreamConstraints[] = [
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          },
          { video: true, audio: false },
        ];
        let stream: MediaStream | null = null;

        for (const constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint);
            break;
          } catch {
            stream = null;
          }
        }

        if (!stream) throw new Error('Camera unavailable');

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
        setError('');
      } catch {
        setCameraReady(false);
        setError(labels.cameraUnavailable);
      }
    }

    void startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [labels.cameraUnavailable]);

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
    };
  }, [frontPreview]);

  useEffect(() => {
    return () => {
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [backPreview]);

  function setSidePhoto(blob: Blob) {
    const url = URL.createObjectURL(blob);
    if (side === 'front') {
      setFrontBlob(blob);
      setFrontPreview(url);
      setSide('back');
    } else {
      setBackBlob(blob);
      setBackPreview(url);
    }
    setError('');
  }

  function canvasToJpegBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Photo conversion failed'));
        },
        'image/jpeg',
        0.92,
      );
    });
  }

  async function normalizeImageToJpeg(source: CanvasImageSource, width: number, height: number) {
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable');
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvasToJpegBlob(canvas);
  }

  function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Photo load failed'));
      image.src = url;
    });
  }

  async function captureCurrentSide() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.videoWidth || !video.videoHeight) {
      setError(labels.cameraUnavailable);
      return;
    }

    try {
      const blob = await normalizeImageToJpeg(video, video.videoWidth, video.videoHeight);
      setSidePhoto(blob);
    } catch {
      setError(labels.photoError);
    }
  }

  async function handleFilePhoto(file: File) {
    const imageUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(imageUrl);
      const blob = await normalizeImageToJpeg(image, image.naturalWidth, image.naturalHeight);
      setSidePhoto(blob);
    } catch {
      setError(labels.photoError);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  function resetPhotos() {
    setSide('front');
    setFrontBlob(null);
    setBackBlob(null);
    setFrontPreview('');
    setBackPreview('');
    setError('');
  }

  async function submitDocument() {
    if (!frontBlob || !backBlob) {
      setError(labels.needBoth);
      return;
    }
    setBusy(true);
    setError('');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('front', frontBlob, 'front.jpg');
    formData.append('back', backBlob, 'back.jpg');

    try {
      const response = await fetch('/api/pdf/id-document', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? labels.working);
        return;
      }
      onComplete(data.fileName as string);
    } catch {
      setError(labels.photoError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="id-capture-panel">
      <h3>{labels.title}</h3>
      <p>{side === 'front' ? labels.front : labels.back}</p>
      <input
        ref={fileInputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = '';
          if (file) void handleFilePhoto(file);
        }}
      />
      <div className="id-capture-stage">
        <video ref={videoRef} className="id-capture-video" playsInline muted />
        {!cameraReady ? <div className="id-capture-overlay">{labels.working}</div> : null}
      </div>
      <div className="id-capture-previews">
        <div className={frontPreview ? 'ready' : ''}>
          <span>{labels.front}</span>
          {frontPreview ? <img src={frontPreview} alt="Front ID" /> : null}
        </div>
        <div className={backPreview ? 'ready' : ''}>
          <span>{labels.back}</span>
          {backPreview ? <img src={backPreview} alt="Back ID" /> : null}
        </div>
      </div>
      {error ? <div className="notice">{error}</div> : null}
      <div className="button-row">
        <button className="btn" type="button" onClick={() => void captureCurrentSide()} disabled={!cameraReady || busy}>
          <Camera size={18} />
          {labels.capture}
        </button>
        <button className="btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          <ImagePlus size={18} />
          {labels.choosePhoto}
        </button>
        <button className="btn" type="button" onClick={resetPhotos} disabled={busy}>
          <RefreshCw size={18} />
          {labels.retake}
        </button>
        <button className="btn primary" type="button" onClick={() => void submitDocument()} disabled={!frontBlob || !backBlob || busy}>
          <CheckCircle2 size={18} />
          {labels.submit}
        </button>
      </div>
      {frontBlob && backBlob ? <div className="notice ok">{labels.ready}</div> : null}
    </div>
  );
}
