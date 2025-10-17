import React, { useState, useEffect } from 'react';
import emrIntegration from '../services/emrIntegrationAPI';
import './EMRConfigScreen.css';

function EMRConfigScreen({ navigate }) {
  const [emrType, setEmrType] = useState('');
  const [config, setConfig] = useState({
    fhirEndpoint: '',
    clientId: '',
    apiKey: '',
    format: 'fhir'
  });
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Load existing config
    const existingConfig = emrIntegration.config;
    if (existingConfig) {
      setEmrType(existingConfig.emrType || '');
      setConfig({
        fhirEndpoint: existingConfig.fhirEndpoint || existingConfig.endpoint || '',
        clientId: existingConfig.clientId || '',
        apiKey: existingConfig.apiKey || '',
        format: existingConfig.format || 'fhir'
      });
    }
  }, []);

  const handleEMRTypeChange = (type) => {
    setEmrType(type);
    
    // Set default endpoints for known EMRs
    switch(type) {
      case 'epic':
        setConfig({
          ...config,
          fhirEndpoint: 'https://fhir.epic.com/api/FHIR/R4',
          format: 'fhir'
        });
        break;
      case 'cerner':
        setConfig({
          ...config,
          fhirEndpoint: 'https://fhir-myrecord.cerner.com/r4',
          format: 'fhir'
        });
        break;
      case 'athenahealth':
        setConfig({
          ...config,
          fhirEndpoint: 'https://api.athenahealth.com/fhir/r4',
          format: 'fhir'
        });
        break;
      default:
        break;
    }
  };

  const handleSaveConfig = async () => {
    try {
      await emrIntegration.initialize(emrType, config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(`Error saving configuration: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Create a test diagnostic report (sample data)
      const testResult = {
        id: 'test_' + Date.now(),
        child_id: 'test_patient',
        child_name: 'Test Patient',
        date_of_birth: '2015-01-01',
        screening_date: new Date().toISOString(),
        screener_name: 'Test Screener',
        school_code: 'TEST001',
        vision_result: { pass: true, left_eye: '20/20', right_eye: '20/20' },
        hearing_result: { 
          pass: true, 
          frequency_1000_hz: true,
          frequency_2000_hz: true,
          frequency_4000_hz: true
        },
        referral_needed: false
      };

      const result = await emrIntegration.exportResult(testResult);
      
      setTestResult({
        success: result.success,
        message: result.success 
          ? '✅ Connection successful! EMR integration is working.' 
          : `❌ Connection failed: ${result.error}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${error.message}`
      });
    }
    
    setTesting(false);
  };

  return (
    <div className="screen emr-config-screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>←</button>
        <h1 className="screen-title">🏥 EMR Integration</h1>
      </div>

      <div className="screen-content">
        <div className="card">
          <div className="card-header">Configure EMR Connection</div>
          
          <p className="config-intro">
            Connect SKIDS EYEAR to your Electronic Medical Record system to automatically 
            export screening results using HL7 FHIR or HL7 v2 standards.
          </p>

          {/* EMR Type Selection */}
          <div className="form-group">
            <label className="form-label">EMR System</label>
            <select 
              className="form-select"
              value={emrType}
              onChange={(e) => handleEMRTypeChange(e.target.value)}
            >
              <option value="">Select EMR System...</option>
              <option value="epic">Epic (FHIR R4)</option>
              <option value="cerner">Cerner (FHIR R4)</option>
              <option value="athenahealth">Athenahealth</option>
              <option value="custom">Custom / Other</option>
            </select>
          </div>

          {emrType && (
            <>
              {/* FHIR Endpoint */}
              <div className="form-group">
                <label className="form-label">
                  FHIR Endpoint URL
                  <span className="form-hint">The base URL for your FHIR API</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.fhirEndpoint}
                  onChange={(e) => setConfig({ ...config, fhirEndpoint: e.target.value })}
                  placeholder="https://fhir.example.com/api/FHIR/R4"
                />
              </div>

              {/* Client ID */}
              <div className="form-group">
                <label className="form-label">
                  Client ID
                  <span className="form-hint">Your application's client identifier</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  placeholder="your-client-id"
                />
              </div>

              {/* API Key */}
              <div className="form-group">
                <label className="form-label">
                  API Key / Access Token
                  <span className="form-hint">Authentication credentials for the API</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="••••••••••••••••"
                />
              </div>

              {/* Format Selection */}
              <div className="form-group">
                <label className="form-label">Export Format</label>
                <select
                  className="form-select"
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value })}
                >
                  <option value="fhir">HL7 FHIR R4 (Recommended)</option>
                  <option value="hl7v2">HL7 v2.5 Messages</option>
                  <option value="json">Custom JSON</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="info-box">
                <h4>📋 What gets exported?</h4>
                <ul>
                  <li>Patient demographics (ID, name, DOB)</li>
                  <li>Screening date and screener information</li>
                  <li>Vision test results (pass/refer, acuity)</li>
                  <li>Hearing test results (frequency-specific)</li>
                  <li>Referral recommendations</li>
                </ul>
                <p className="info-note">
                  All exports comply with HIPAA security requirements and use encrypted connections.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveConfig}
                  disabled={!config.fhirEndpoint || !config.clientId}
                >
                  {saved ? '✅ Saved!' : '💾 Save Configuration'}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={handleTestConnection}
                  disabled={testing || !config.fhirEndpoint}
                >
                  {testing ? '🔄 Testing...' : '🧪 Test Connection'}
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.message}
                </div>
              )}

              {/* Standards Info */}
              <div className="standards-section">
                <h3>📘 Supported Standards</h3>
                <div className="standards-grid">
                  <div className="standard-card">
                    <div className="standard-icon">🔷</div>
                    <div className="standard-name">HL7 FHIR R4</div>
                    <div className="standard-desc">
                      Modern REST API standard using DiagnosticReport resources
                    </div>
                  </div>
                  
                  <div className="standard-card">
                    <div className="standard-icon">📨</div>
                    <div className="standard-name">HL7 v2.5</div>
                    <div className="standard-desc">
                      Traditional messaging with ORU^R01 observation results
                    </div>
                  </div>
                  
                  <div className="standard-card">
                    <div className="standard-icon">🔐</div>
                    <div className="standard-name">SNOMED CT</div>
                    <div className="standard-desc">
                      Standardized clinical terminology for diagnoses
                    </div>
                  </div>
                  
                  <div className="standard-card">
                    <div className="standard-icon">🧪</div>
                    <div className="standard-name">LOINC</div>
                    <div className="standard-desc">
                      Laboratory and clinical observation identifiers
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!emrType && (
            <div className="emr-selection-help">
              <h3>🤔 Not sure which EMR system you have?</h3>
              <p>
                Contact your hospital's IT department or clinical informatics team. 
                They can provide:
              </p>
              <ul>
                <li>EMR system name and version</li>
                <li>FHIR endpoint URL</li>
                <li>API credentials (Client ID and access token)</li>
                <li>Integration approval and documentation</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EMRConfigScreen;
