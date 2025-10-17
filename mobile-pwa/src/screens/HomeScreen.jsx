import React, { useState, useEffect } from 'react';
import { db } from '../services/indexedDB';
import './HomeScreen.css';

function HomeScreen({ navigate }) {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalResults: 0,
    unsyncedResults: 0
  });
  const [screenerName, setScreenerName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');

  useEffect(() => {
    loadStats();
    loadScreenerInfo();
  }, []);

  const loadStats = async () => {
    try {
      const children = await db.getAllChildren();
      const results = await db.getAllResults();
      const unsynced = await db.getUnsyncedResults();

      setStats({
        totalChildren: children.length,
        totalResults: results.length,
        unsyncedResults: unsynced.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadScreenerInfo = () => {
    const savedName = localStorage.getItem('screenerName') || '';
    const savedSchool = localStorage.getItem('schoolCode') || '';
    setScreenerName(savedName);
    setSchoolCode(savedSchool);
  };

  const saveScreenerInfo = () => {
    localStorage.setItem('screenerName', screenerName);
    localStorage.setItem('schoolCode', schoolCode);
  };

  const handleStartScreening = () => {
    if (!screenerName || !schoolCode) {
      alert('Please enter your name and school code');
      return;
    }
    saveScreenerInfo();
    navigate('qr-scanner', { screenerName, schoolCode });
  };

  const handleImportRoster = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const children = JSON.parse(text);
        
        if (Array.isArray(children)) {
          const count = await db.importChildren(children);
          alert(`✅ Imported ${count} children`);
          loadStats();
        } else {
          alert('❌ Invalid file format');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Failed to import: ' + error.message);
      }
    };
    input.click();
  };

  return (
    <div className="screen home-screen">
      <div className="screen-header">
        <h1 className="screen-title">SKIDS EYEAR Screening</h1>
      </div>

      <div className="screen-content">
        {/* Screener Info */}
        <div className="card">
          <div className="card-header">Screener Information</div>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              className="input"
              value={screenerName}
              onChange={(e) => setScreenerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>School Code</label>
            <input
              type="text"
              className="input"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              placeholder="Enter school code"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalChildren}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalResults}</div>
            <div className="stat-label">Screenings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unsyncedResults}</div>
            <div className="stat-label">Unsynced</div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <button
            className="button button-primary button-large"
            onClick={handleStartScreening}
          >
            📷 Start Screening
          </button>

          <button
            className="button button-secondary"
            onClick={() => navigate('results')}
          >
            📊 View Results
          </button>

          <button
            className="button button-secondary"
            onClick={() => navigate('export')}
          >
            📤 Export Data
          </button>

          <button
            className="button button-secondary"
            onClick={handleImportRoster}
          >
            📥 Import Student Roster
          </button>
        </div>

        {/* Advanced Features */}
        <div className="card">
          <div className="card-header">⚙️ Advanced Features</div>
          <div className="advanced-features-grid">
            <button
              className="feature-button"
              onClick={() => navigate('calibration')}
            >
              <span className="feature-icon">🎧</span>
              <span className="feature-label">Device Calibration</span>
            </button>
            
            <button
              className="feature-button"
              onClick={() => navigate('analytics')}
            >
              <span className="feature-icon">📈</span>
              <span className="feature-label">Analytics Dashboard</span>
            </button>
            
            <button
              className="feature-button"
              onClick={() => navigate('emr-config')}
            >
              <span className="feature-icon">🏥</span>
              <span className="feature-label">EMR Integration</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="info-box">
          <p><strong>Quick Start:</strong></p>
          <ol>
            <li>Import student roster (JSON/CSV)</li>
            <li>Enter your name and school code</li>
            <li>Tap "Start Screening"</li>
            <li>Scan QR code or search for student</li>
            <li>Conduct vision and hearing tests</li>
            <li>Review and export results</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
