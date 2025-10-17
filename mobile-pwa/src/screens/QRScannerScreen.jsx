import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { db } from '../services/indexedDB';
import './QRScannerScreen.css';

function QRScannerScreen({ navigate, data }) {
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadChildren();
    return () => {
      stopCamera();
    };
  }, []);

  const loadChildren = async () => {
    try {
      const allChildren = await db.getAllChildren();
      setChildren(allChildren);
    } catch (err) {
      console.error('Error loading children:', err);
      setError('Failed to load student roster');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setScanning(true);
        setError(null);
        scanQRCode();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please use manual search.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }
    }

    requestAnimationFrame(scanQRCode);
  };

  const handleQRCodeDetected = async (qrData) => {
    try {
      stopCamera();
      const childData = JSON.parse(qrData);
      const child = await db.getChild(childData.id);
      
      if (child) {
        setSelectedChild(child);
      } else {
        setError('Student not found in roster');
      }
    } catch (err) {
      console.error('QR decode error:', err);
      setError('Invalid QR code');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      loadChildren();
      return;
    }

    try {
      const results = await db.searchChildren(query);
      setChildren(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
  };

  const handleStartScreening = () => {
    if (!selectedChild) return;

    navigate('vision', {
      child: selectedChild,
      screenerName: data.screenerName,
      schoolCode: data.schoolCode
    });
  };

  return (
    <div className="screen qr-scanner-screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>
          ←
        </button>
        <h1 className="screen-title">Select Student</h1>
      </div>

      <div className="screen-content">
        {!selectedChild && (
          <>
            {/* QR Scanner Section */}
            <div className="card">
              <div className="card-header">📷 Scan QR Code</div>
              {error && (
                <div className="error-message">{error}</div>
              )}
              
              {!scanning ? (
                <button
                  className="button button-primary button-large"
                  onClick={startCamera}
                >
                  Start Camera
                </button>
              ) : (
                <div className="camera-container">
                  <video ref={videoRef} className="camera-preview" />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <button
                    className="button button-danger"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </button>
                </div>
              )}
            </div>

            {/* Manual Search Section */}
            <div className="card">
              <div className="card-header">🔍 Manual Search</div>
              <input
                type="text"
                className="input"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              
              <div className="children-list">
                {children.length === 0 ? (
                  <p className="empty-message">No students found. Import a roster first.</p>
                ) : (
                  children.map(child => (
                    <div
                      key={child.id}
                      className="child-item"
                      onClick={() => handleSelectChild(child)}
                    >
                      <div className="child-name">{child.name}</div>
                      <div className="child-info">
                        Grade {child.grade} • DOB: {child.date_of_birth}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {selectedChild && (
          <div className="card">
            <div className="card-header">✅ Selected Student</div>
            <div className="selected-child-info">
              <p><strong>Name:</strong> {selectedChild.name}</p>
              <p><strong>ID:</strong> {selectedChild.id}</p>
              <p><strong>Grade:</strong> {selectedChild.grade}</p>
              <p><strong>DOB:</strong> {selectedChild.date_of_birth}</p>
            </div>
            
            <div className="actions">
              <button
                className="button button-primary button-large"
                onClick={handleStartScreening}
              >
                Start Vision Test →
              </button>
              <button
                className="button button-secondary"
                onClick={() => setSelectedChild(null)}
              >
                Change Student
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScannerScreen;
