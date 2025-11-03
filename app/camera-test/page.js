'use client';

import { useEffect, useRef, useState } from 'react';

export default function CameraTest() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get list of available cameras
  const getDevices = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;

    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Could not list camera devices: ' + err.message);
    }
  };

  // Start camera
  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setError('Media devices API not available');
      return;
    }

    try {
      setError(null);

      const constraints = {
        video: selectedDevice
          ? { deviceId: { exact: selectedDevice } }
          : { facingMode: 'environment' },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsCameraOn(true);

      // Get devices again after permission is granted
      await getDevices();
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Camera error: ${err.name} - ${err.message}`);
      setIsCameraOn(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    if (isClient) {
      getDevices();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isClient]);

  // Restart camera when device changes
  useEffect(() => {
    if (isCameraOn && selectedDevice) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  }, [selectedDevice]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Camera Test
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Test your camera access for barcode scanning
          </p>
          <a
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to main app
          </a>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            System Information
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Browser:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'Unknown'}
              {typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && (
                <span className="text-red-600 ml-2">⚠️ Camera requires HTTPS</span>
              )}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              <strong>MediaDevices API:</strong>{' '}
              {typeof navigator !== 'undefined' && navigator.mediaDevices ? '✅ Supported' : '❌ Not supported'}
            </p>
          </div>
        </div>

        {devices.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              Available Cameras ({devices.length})
            </h2>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Camera Preview
            </h2>
            {isCameraOn ? (
              <button
                onClick={stopCamera}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Camera
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
              <p className="text-sm mt-2">
                Common fixes:
              </p>
              <ul className="text-sm list-disc list-inside mt-1">
                <li>Grant camera permissions in your browser</li>
                <li>Close other apps using the camera</li>
                <li>Try a different browser</li>
                <li>Use HTTPS if not on localhost</li>
              </ul>
            </div>
          )}

          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p>Click "Start Camera" to begin</p>
              </div>
            )}
          </div>

          {isCameraOn && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <p className="text-green-700 dark:text-green-400 font-semibold">
                ✅ Camera is working!
              </p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                If you can see the camera feed above, your camera is properly configured and should work with the barcode scanner.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Troubleshooting
          </h2>
          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              <strong className="text-zinc-900 dark:text-white">Permission Denied:</strong>
              <p>Check your browser settings and make sure camera access is allowed for this site.</p>
            </div>
            <div>
              <strong className="text-zinc-900 dark:text-white">No cameras found:</strong>
              <p>Make sure your device has a camera and it's not being used by another application.</p>
            </div>
            <div>
              <strong className="text-zinc-900 dark:text-white">HTTPS Required:</strong>
              <p>Camera access requires HTTPS in production. On localhost, HTTP should work.</p>
            </div>
            <div>
              <strong className="text-zinc-900 dark:text-white">Browser compatibility:</strong>
              <p>Modern browsers (Chrome, Firefox, Safari, Edge) support camera access. Try updating your browser if you have issues.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
