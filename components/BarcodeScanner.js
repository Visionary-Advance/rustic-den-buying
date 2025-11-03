'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode('barcode-reader');
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5Qrcode.BARCODE_FORMATS.UPC_A,
            Html5Qrcode.BARCODE_FORMATS.UPC_E,
            Html5Qrcode.BARCODE_FORMATS.UPC_EAN_EXTENSION,
            Html5Qrcode.BARCODE_FORMATS.EAN_13,
            Html5Qrcode.BARCODE_FORMATS.EAN_8,
            Html5Qrcode.BARCODE_FORMATS.CODE_128,
            Html5Qrcode.BARCODE_FORMATS.CODE_39,
          ],
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText, decodedResult) => {
            if (isMounted) {
              onScan(decodedText);
              stopScanner();
            }
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent and normal)
          }
        );

        if (isMounted) {
          setIsScanning(true);
          setError(null);
        }
      } catch (err) {
        console.error('Scanner error:', err);
        if (isMounted) {
          setError(
            'Unable to access camera. Please ensure you have granted camera permissions.'
          );
        }
      }
    };

    const stopScanner = async () => {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
      if (isMounted) {
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [onScan]);

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
              id="barcode-reader"
              className="w-full rounded-lg overflow-hidden"
            />
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              Position the barcode within the frame to scan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
