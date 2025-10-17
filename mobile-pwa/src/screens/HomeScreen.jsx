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
  const [showQuickStart, setShowQuickStart] = useState(false);

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

        {/* Info - Inspirational Content & Collapsible Quick Start */}
        <div className="info-section">
          {/* Inspirational Banner */}
          <div className="inspiration-banner">
            <div className="inspiration-icon">👁️👂</div>
            <div className="inspiration-content">
              <h3 className="inspiration-title">Empowering Every Child's Potential</h3>
              <p className="inspiration-text">
                Early detection changes lives. Your screening work identifies vision and hearing 
                issues that could affect a child's learning, development, and future success.
              </p>
              <div className="impact-stats">
                <div className="impact-item">
                  <span className="impact-number">80%</span>
                  <span className="impact-label">of learning is visual</span>
                </div>
                <div className="impact-item">
                  <span className="impact-number">1 in 5</span>
                  <span className="impact-label">children have vision problems</span>
                </div>
                <div className="impact-item">
                  <span className="impact-number">1 in 8</span>
                  <span className="impact-label">children have hearing loss</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="tips-section">
            <div className="tips-header">💡 Pro Tips for Effective Screening</div>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">🎯</div>
                <div className="tip-title">Create a Quiet Environment</div>
                <div className="tip-text">Find a calm space with minimal distractions for accurate results</div>
              </div>
              <div className="tip-card">
                <div className="tip-icon">😊</div>
                <div className="tip-title">Make It Fun</div>
                <div className="tip-text">Use encouraging language and turn tests into engaging activities</div>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📋</div>
                <div className="tip-title">Follow Protocol</div>
                <div className="tip-text">Consistent procedures ensure reliable, comparable results</div>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🎧</div>
                <div className="tip-title">Check Equipment</div>
                <div className="tip-text">Calibrate headphones and verify device settings before starting</div>
              </div>
            </div>
          </div>

          {/* Collapsible Quick Start */}
          <div className="quick-start-section">
            <button 
              className="quick-start-toggle"
              onClick={() => setShowQuickStart(!showQuickStart)}
            >
              <span className="toggle-icon">{showQuickStart ? '▼' : '▶'}</span>
              <span className="toggle-text">Quick Start Guide</span>
            </button>
            
            {showQuickStart && (
              <div className="quick-start-content">
                <ol className="quick-start-steps">
                  <li>
                    <strong>Import Student Roster:</strong> Click "Import Student Roster" to load your class list (JSON/CSV format)
                  </li>
                  <li>
                    <strong>Enter Your Information:</strong> Fill in your name and school code above
                  </li>
                  <li>
                    <strong>Start Screening:</strong> Tap the "Start Screening" button to begin
                  </li>
                  <li>
                    <strong>Identify Student:</strong> Scan QR code or search by name
                  </li>
                  <li>
                    <strong>Conduct Tests:</strong> Complete vision test (ETDRS chart) and hearing test (frequency identification)
                  </li>
                  <li>
                    <strong>Review & Export:</strong> View results and export to EMR or file
                  </li>
                </ol>
                
                <div className="quick-start-footer">
                  <p>💾 <strong>Offline Ready:</strong> All data is stored locally - no internet required during screening</p>
                  <p>🔒 <strong>HIPAA Compliant:</strong> Your data is secure and private</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
