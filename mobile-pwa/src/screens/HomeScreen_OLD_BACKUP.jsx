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
      alert('Please enter your name and school code');
      return;
    }
    saveScreenerInfo();
    navigate('qr-scanner', { screenerName, schoolCode });
  };

  const exportAllData = async () => {
    try {
      const children = await db.getAllChildren();
      const results = await db.getAllResults();
      
      if (children.length === 0 && results.length === 0) {
        alert('⚠️ No data to export. Import students and complete screenings first.');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      
      // Create comprehensive JSON export
      const exportData = {
        export_date: new Date().toISOString(),
        school_code: schoolCode || 'Unknown',
        screener_name: screenerName || 'Unknown',
        students: children,
        screening_results: results,
        summary: {
          total_students: children.length,
          total_screenings: results.length,
          pass_rate: results.length > 0 
            ? ((results.filter(r => r.vision_result?.pass && r.hearing_result?.pass).length / results.length) * 100).toFixed(1) + '%'
            : 'N/A'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skids-export-all-${schoolCode || 'school'}-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`✅ Exported all data!\n\n${children.length} students\n${results.length} screening results\n\nFile saved as JSON for backup or transfer to another device.`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Export failed: ' + error.message);
    }
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

    // Create CSV
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

        // Parse based on file type
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
            📤 Export Results (CSV/FHIR/HL7)
          </button>

          <button
            className="button button-secondary"
            onClick={exportAllData}
            title="Export complete database backup (students + results)"
          >
            💾 Backup All Data
          </button>

          <button
            className="button button-secondary"
            onClick={handleImportRoster}
          >
            📥 Import Student Roster
          </button>

          <button
            className="button button-secondary"
            onClick={downloadSampleRoster}
            title="Download a sample CSV template to fill with your students"
          >
            📋 Download Sample Roster
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
