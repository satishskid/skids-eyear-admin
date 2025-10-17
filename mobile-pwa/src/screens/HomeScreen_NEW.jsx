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
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

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
      setShowProfileEdit(true);
      return;
    }
    saveScreenerInfo();
    navigate('qr-scanner', { screenerName, schoolCode });
  };

  const downloadSampleRoster = () => {
    const sampleData = [
      {
        id: 'STU001',
        name: 'John Doe',
        date_of_birth: '2010-05-15',
        grade: '5',
        school_code: schoolCode || 'SCH001',
        parent_contact: '555-1234'
      },
      {
        id: 'STU002',
        name: 'Jane Smith',
        date_of_birth: '2011-08-22',
        grade: '4',
        school_code: schoolCode || 'SCH001',
        parent_contact: '555-5678'
      },
      {
        id: 'STU003',
        name: 'Michael Johnson',
        date_of_birth: '2012-03-10',
        grade: '3',
        school_code: schoolCode || 'SCH001',
        parent_contact: '555-9012'
      }
    ];

    const headers = ['id', 'name', 'date_of_birth', 'grade', 'school_code', 'parent_contact'];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-roster-${schoolCode || 'school'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('📥 Sample roster CSV downloaded! Fill it with your students and re-import.');
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
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
        let children;

        if (file.name.endsWith('.csv')) {
          children = parseCSV(text);
        } else {
          children = JSON.parse(text);
        }
        
        if (Array.isArray(children) && children.length > 0) {
          const count = await db.importChildren(children);
          alert(`✅ Imported ${count} children successfully!`);
          loadStats();
        } else {
          alert('❌ Invalid file format or empty roster');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Failed to import: ' + error.message);
      }
    };
    input.click();
  };

  return (
    <div className="screen home-screen-new">
      {/* Compact Profile Header */}
      <div className="profile-header">
        <div className="profile-info" onClick={() => setShowProfileEdit(!showProfileEdit)}>
          <div className="profile-avatar">
            {screenerName ? screenerName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="profile-details">
            <div className="profile-name">{screenerName || 'Tap to set name'}</div>
            <div className="profile-school">{schoolCode || 'School Code'}</div>
          </div>
        </div>
        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings & Tools"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m0-18l-2 2m4-2l-2 2m-6 6h6m6 0h6M1 12l2 2m-2-4l2 2m18 0l-2 2m2-4l-2 2"></path>
          </svg>
        </button>
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay" onClick={() => setShowProfileEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close" onClick={() => setShowProfileEdit(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="input"
                  value={screenerName}
                  onChange={(e) => setScreenerName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
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
            <div className="modal-footer">
              <button 
                className="button button-primary" 
                onClick={() => {
                  saveScreenerInfo();
                  setShowProfileEdit(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <>
          <div className="settings-backdrop" onClick={() => setShowSettings(false)}></div>
          <div className="settings-drawer">
            <div className="settings-header">
              <h3>Settings & Tools</h3>
              <button onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div className="settings-section">
              <h4 className="settings-title">📋 Data Management</h4>
              <button className="settings-item" onClick={() => { navigate('results'); setShowSettings(false); }}>
                <span className="settings-icon">📊</span>
                <div className="settings-text">
                  <span className="settings-label">View Results</span>
                  <span className="settings-desc">Browse all screening results</span>
                </div>
              </button>
              <button className="settings-item" onClick={() => { navigate('export'); setShowSettings(false); }}>
                <span className="settings-icon">📤</span>
                <div className="settings-text">
                  <span className="settings-label">Export Data</span>
                  <span className="settings-desc">CSV, FHIR, or HL7 format</span>
                </div>
              </button>
              <button className="settings-item" onClick={() => { handleImportRoster(); setShowSettings(false); }}>
                <span className="settings-icon">📥</span>
                <div className="settings-text">
                  <span className="settings-label">Import Roster</span>
                  <span className="settings-desc">Load student list (CSV/JSON)</span>
                </div>
              </button>
              <button className="settings-item" onClick={() => { downloadSampleRoster(); setShowSettings(false); }}>
                <span className="settings-icon">📋</span>
                <div className="settings-text">
                  <span className="settings-label">Download Sample</span>
                  <span className="settings-desc">Get CSV template</span>
                </div>
              </button>
            </div>

            <div className="settings-section">
              <h4 className="settings-title">⚙️ Advanced Tools</h4>
              <button className="settings-item" onClick={() => { navigate('calibration'); setShowSettings(false); }}>
                <span className="settings-icon">🎧</span>
                <div className="settings-text">
                  <span className="settings-label">Device Calibration</span>
                  <span className="settings-desc">Test audio output levels</span>
                </div>
              </button>
              <button className="settings-item" onClick={() => { navigate('analytics'); setShowSettings(false); }}>
                <span className="settings-icon">📈</span>
                <div className="settings-text">
                  <span className="settings-label">Analytics Dashboard</span>
                  <span className="settings-desc">View statistics & trends</span>
                </div>
              </button>
              <button className="settings-item" onClick={() => { navigate('emr-config'); setShowSettings(false); }}>
                <span className="settings-icon">🏥</span>
                <div className="settings-text">
                  <span className="settings-label">EMR Integration</span>
                  <span className="settings-desc">Configure health records export</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="screen-content-new">
        {/* Quick Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">{stats.totalChildren}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalResults}</div>
            <div className="stat-label">Screenings</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value stat-unsynced">{stats.unsyncedResults}</div>
            <div className="stat-label">Unsynced</div>
          </div>
        </div>

        {/* Primary Action */}
        <div className="primary-action-section">
          <button
            className="button-hero"
            onClick={handleStartScreening}
          >
            <span className="button-hero-icon">🩺</span>
            <div className="button-hero-content">
              <span className="button-hero-text">Start Screening</span>
              <span className="button-hero-subtitle">Vision & Hearing Tests</span>
            </div>
          </button>
        </div>

        {/* Value Proposition */}
        <div className="value-prop-section">
          <div className="value-prop-card">
            <div className="value-prop-icon">👁️</div>
            <div className="value-prop-content">
              <h4>Early Detection Saves Futures</h4>
              <p>80% of learning is visual. Identify issues before they impact education.</p>
            </div>
          </div>

          <div className="value-prop-card">
            <div className="value-prop-icon">👂</div>
            <div className="value-prop-content">
              <h4>Every Child Deserves to Be Heard</h4>
              <p>1 in 8 children have hearing loss. Your screening makes a difference.</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="tips-compact">
          <div className="tips-header">💡 Quick Tips</div>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">🤫</span>
              <span className="tip-text">Find a quiet room for accurate results</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">😊</span>
              <span className="tip-text">Make it fun - use encouraging language</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎧</span>
              <span className="tip-text">Calibrate headphones before each session</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="footer-info">
          <div className="footer-badge">
            <span className="badge-icon">💾</span>
            <span className="badge-text">Offline Ready</span>
          </div>
          <div className="footer-badge">
            <span className="badge-icon">🔒</span>
            <span className="badge-text">HIPAA Compliant</span>
          </div>
          <div className="footer-badge">
            <span className="badge-icon">📱</span>
            <span className="badge-text">PWA Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
