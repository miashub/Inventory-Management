// frontend/src/pages/Scan.jsx

/**
 * Scan Page
 *
 * Provides a real-time UPC barcode scanner using the device's camera.
 * After scanning, it fetches product info from the backend and displays suggestions.
 * - If the product exists → allows editing/viewing.
 * - If not found → redirects to Add Product page with barcode.
 * Also displays a log of today's scans.
 *
 * Key Features:
 * - Live scanner using Html5Qrcode
 * - Beep sound on successful scan
 * - Captures camera frame image
 * - Manages camera resources safely
 * - Supports scan history logging and dynamic redirection
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';


// Load API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Scan() {
  const [data, setData] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [scanning, setScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [todayScans, setTodayScans] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const scannerRef = useRef(null);
  const scannerRunningRef = useRef(false);
  const lastScannedRef = useRef('');
  const timeoutRef = useRef(null);
  const beepRef = useRef(new Audio('/beep.mp3'));

  // Gracefully stops the scanner and clears video resources
  const stopScanner = async () => {
    try {
      if (scannerRunningRef.current && scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.warn('Html5Qrcode failed to stop:', err);
    } finally {
      scannerRunningRef.current = false;
      scannerRef.current = null;

      // Stop and remove all video tracks manually
      document.querySelectorAll('video').forEach((v) => {
        if (v.srcObject) {
          v.srcObject.getTracks().forEach((t) => t.stop());
          v.srcObject = null;
        }
        v.remove();
      });
    }
  };

  // Capture current frame from the video as base64 image
  const captureFrame = useCallback(async () => {
    const video = document.querySelector('video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imgData);
    await stopScanner();
  }, []);

  // Fetch product info by barcode
  const fetchProduct = useCallback(async (barcode) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/barcode/${barcode}/`);
      if (res.status === 200) {
        setProductInfo(res.data.exact || null);
        setSimilarProducts(res.data.similar || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setProductInfo(null);
        setSimilarProducts([]);
      } else {
        console.error('Fetch error:', err);
      }
    }
  }, []);

  // Initialize scanner and handle barcode detection
  const startScanner = useCallback(() => {
    const scanner = new Html5Qrcode('reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.UPC_A],
    });

    Html5Qrcode.getCameras()
      .then((devices) => {
        const cam = devices.find((d) => d.label.toLowerCase().includes('back')) || devices[0];

        scanner.start(
          cam.id,
          { fps: 60, qrbox: { width: 400, height: 400 }, disableFlip: true },
          async (decodedText) => {
            if (decodedText && decodedText !== lastScannedRef.current) {
              lastScannedRef.current = decodedText;
              beepRef.current.play();
              setData(decodedText);
              await captureFrame();
              setScanning(false);
              fetchProduct(decodedText);
            }
          },
          () => {} 
        ).then(() => {
          scannerRunningRef.current = true;
          scannerRef.current = scanner;
        }).catch((err) => {
          console.error('Start camera error:', err);
          setCameraError(true);
        });
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setCameraError(true);
      });
  }, [captureFrame, fetchProduct]);

  // Start/stop scanner when scanning state changes
  useEffect(() => {
    const currentTimeout = timeoutRef.current;
    if (scanning) {
      setCapturedImage(null);
      startScanner();
    }
    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
      stopScanner();
    };
  }, [scanning, startScanner]);

  // Pause scanner when browser tab is inactive
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (!scannerRunningRef.current && !capturedImage && scanning) {
          startScanner();
        }
      } else {
        stopScanner();
      }
    };

    const handleBeforeUnload = () => stopScanner();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scanning, capturedImage, startScanner]);

  // Fetch today's scan history on mount
  useEffect(() => {
    axios.get('${API_BASE_URL}/api/history/today/').then((res) => setTodayScans(res.data));
  }, []);

  // Resets scan state for a new scan
  const resetScan = async () => {
    await stopScanner();
    setCapturedImage(null);
    setProductInfo(null);
    setSimilarProducts([]);
    setData('');
    lastScannedRef.current = '';
    setTimeout(() => setScanning(true), 300);
  };

  // Redirects to Add Product page with scanned barcode
  const redirectToAddWithBarcode = async () => {
    await stopScanner();
    const params = new URLSearchParams(location.search);
    params.set('barcode', data);
    params.set('source', 'scanned');
    navigate(`/add?${params.toString()}`);
  };

  // ---- JSX Output ----
  return (
    <div className="flex flex-col items-center mt-8 px-4">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">Scan UPC Barcode</h2>

      {/* Live scanner or captured preview */}
      {!capturedImage && scanning ? (
        <>
          <div id="reader" className="w-full max-w-sm h-64 rounded-md shadow-md overflow-hidden" />
          <p className="mt-2 text-sm text-gray-700">Scanned: {data || 'waiting...'}</p>
        </>
      ) : (
        <>
          <img src={capturedImage} alt="Scanned" className="w-full max-w-sm h-64 rounded-md shadow-md object-cover" />
          <p className="mt-2 text-sm text-gray-700">Scanned: {data}</p>
        </>
      )}

      {/* Error message if camera fails */}
      {cameraError && (
        <p className="mt-2 text-red-500 text-sm">⚠️ Camera error. Check permissions or try another browser/device.</p>
      )}

      {/* Product match display */}
      {productInfo && (
        <div className="mt-6 p-4 bg-white border border-orange-200 rounded-xl shadow max-w-md w-full">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">Suggested Product</h3>
          <p><strong>Name:</strong> {productInfo.name}</p>
          <p><strong>SKU:</strong> {productInfo.sku}</p>
          <p><strong>Barcode:</strong> {productInfo.barcode}</p>
          <p><strong>Stock:</strong> {productInfo.quantity}</p>
          <button
            onClick={() => navigate(`/edit/${productInfo.id}?source=scanned`)}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded"
          >
            View Product
          </button>
        </div>
      )}

      {/* Similar products list */}
      {similarProducts.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-orange-100 rounded-md shadow max-w-md w-full">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">Other Possibilities</h3>
          <ul className="space-y-1">
            {similarProducts.map((product) => (
              <li key={product.id} className="flex justify-between items-center">
                <span>{product.name} (Barcode: {product.barcode})</span>
                <button
                  onClick={() => navigate(`/edit/${product.id}?source=scanned`)}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Option to add a new product if no match */}
      {!productInfo && !similarProducts.length && data && (
        <button
          onClick={redirectToAddWithBarcode}
          className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        >
          Add New Product
        </button>
      )}

      {/* Control buttons */}
      {!scanning && (
        <button onClick={resetScan} className="mt-4 text-sm text-indigo-600 underline">
          Scan Another Item
        </button>
      )}
      <button
        onClick={() => {
          stopScanner();
          setScanning(false);
          navigate('/');
        }}
        className="mt-6 text-indigo-600 hover:underline text-base"
      >
        Cancel
      </button>

      {/* Scan history table */}
      {todayScans.length > 0 && (
        <div className="mt-10 w-full max-w-4xl bg-white border border-orange-200 rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-indigo-800 mb-6 border-b border-orange-300 pb-2 text-center">
            Today’s Scan Log
          </h3>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-orange-50 text-indigo-700 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Barcode</th>
                  <th className="px-6 py-3">Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {todayScans.map((item, idx) => (
                  <tr key={idx} className="bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 ease-in-out">
                    <td className="px-6 py-3 font-medium">{item.product?.name || 'Unknown'}</td>
                    <td className="px-6 py-3">{item.product?.sku || 'N/A'}</td>
                    <td className="px-6 py-3">{item.barcode}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(item.scanned_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
