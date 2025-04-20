// frontend/pages/BarcodeScannerModal.jsx

/**
 * BarcodeScannerModal Component
 *
 * A modal-based barcode scanner used in forms like "Add Product."
 * It uses Html5Qrcode to access the device camera, detects UPC_A barcodes,
 * plays a beep sound on successful scan, and checks if the scanned product exists.
 *
 * If the product exists → redirects to Edit Product page.
 * If not found → passes barcode back to parent form via `onScan`.
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility.
 * - onClose (function): Callback to close the modal.
 * - onScan (function): Callback with scanned barcode value.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const lastScannedRef = useRef('');
  const beepRef = useRef(new Audio('/beep.mp3'));
  const [cameraError, setCameraError] = useState(false);

  // Stop and cleanup scanner instance
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.warn('Failed to stop scanner:', err);
    } finally {
      scannerRef.current = null;
    }
  };

  // Initialize scanner and handle successful scans
  const startScanner = useCallback(() => {
    const scanner = new Html5Qrcode('scanner', {
      formatsToSupport: [Html5QrcodeSupportedFormats.UPC_A],
    });

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices.length) return;

        const backCam = devices.find((d) =>
          d.label.toLowerCase().includes('back')
        ) || devices[0];

        scanner
          .start(
            backCam.id,
            { fps: 60, qrbox: { width: 300, height: 300 } },
            (decodedText) => {
              // Prevent repeated scans
              if (decodedText && decodedText !== lastScannedRef.current) {
                lastScannedRef.current = decodedText;
                beepRef.current.play();
                stopScanner();

                // Check if product exists by barcode
                axios
                  .get(`/api/products/barcode/${decodedText}/?source=scan-from-add`)
                  .then((res) => {
                    const exact = res.data?.exact;
                    if (exact?.id) {
                      // Redirect to Edit page if product exists
                      window.location.href = `/edit/${exact.id}?source=scanned`;
                    } else {
                      // Pass barcode to parent if not found
                      onScan(decodedText);
                      onClose();
                    }
                  })
                  .catch((err) => {
                    if (err.response?.status === 404) {
                      onScan(decodedText);
                      onClose();
                    } else {
                      console.error('Error checking product:', err);
                      alert('Something went wrong. Please try again.');
                    }
                  });
              }
            }
          )
          .then(() => {
            scannerRef.current = scanner;
          })
          .catch((err) => {
            console.error('Start camera error:', err);
            setCameraError(true);
          });
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setCameraError(true);
      });
  }, [onClose, onScan]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setCameraError(false);
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner]);

  // Hide modal if not active
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full relative">
        <h3 className="text-lg font-semibold text-center mb-2">Scan Barcode</h3>

        {/* Scanner View */}
        <div id="scanner" ref={containerRef} className="w-full h-64 rounded border" />

        {/* Error Message */}
        {cameraError && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Unable to access camera. Try another device or browser.
          </p>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="absolute top-1 right-2 text-gray-700 hover:text-red-500 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
