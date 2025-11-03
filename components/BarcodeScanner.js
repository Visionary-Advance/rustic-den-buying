'use client';

import { useEffect, useRef, useState } from 'react';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScan, setLastScan] = useState('');

  useEffect(() => {
    let isMounted = true;
    let Quagga;

    const startScanner = async () => {
      try {
        // Dynamically import Quagga2
        const QuaggaModule = await import('@ericblade/quagga2');
        Quagga = QuaggaModule.default;

        await Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment',
              aspectRatio: { min: 1, max: 2 },
            },
            area: { // defines area of video to scan
              top: '20%',
              right: '10%',
              left: '10%',
              bottom: '20%',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              'upc_reader',
              'upc_e_reader',
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
            ],
            multiple: false,
          },
          locate: true,
        }, (err) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            if (isMounted) {
              setError(`Failed to initialize scanner: ${err.message || err}`);
            }
            return;
          }

          if (isMounted) {
            console.log('Scanner initialized successfully');
            Quagga.start();
            setIsScanning(true);
            setError(null);
          }
        });

        // Set up detection handler
        Quagga.onDetected((result) => {
          if (!isMounted) return;

          const code = result.codeResult.code;
          const format = result.codeResult.format;

          // Only accept high-quality scans
          if (code && code !== lastScan) {
            console.log('✅ Barcode detected:', code, 'Format:', format);

            // Check if this is a valid UPC/EAN (should be numeric)
            if (/^\d+$/.test(code)) {
              setLastScan(code);
              onScan(code);
              Quagga.stop();
              setIsScanning(false);
            }
          }
        });

        // Optional: log processed frames for debugging
        Quagga.onProcessed((result) => {
          if (!isMounted) return;

          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            // Draw boxes around detected barcodes
            if (result.boxes) {
              drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
              result.boxes.filter(box => box !== result.box).forEach(box => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
              });
            }

            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
          }
        });

      } catch (err) {
        console.error('Scanner error:', err);
        if (isMounted) {
          setError('Unable to access camera. Please ensure you have granted camera permissions.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (Quagga) {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      }
    };
  }, [onScan, lastScan]);

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Scan Barcode
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

{error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div
              ref={scannerRef}
              className="w-full rounded-lg overflow-hidden bg-black relative"
              style={{ minHeight: '400px' }}
            >
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-center text-zinc-600 dark:text-zinc-400 font-semibold">
                Position the UPC barcode in the center
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Scanning tips:</strong>
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-500 list-disc list-inside mt-1 space-y-1">
                  <li><strong>Lighting:</strong> Bright, even light (no shadows or glare)</li>
                  <li><strong>Orientation:</strong> Keep barcode horizontal</li>
                  <li><strong>Distance:</strong> 4-8 inches from camera</li>
                  <li><strong>Stability:</strong> Hold steady for 1-2 seconds</li>
                  <li><strong>Green/blue boxes:</strong> Appear when barcode is detected</li>
                </ul>
              </div>
              {lastScan && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✅ Scanned: <strong>{lastScan}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
