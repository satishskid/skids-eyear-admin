import React, { useState, useEffect } from 'react';
import { db } from '../services/indexedDB';
import './ExportScreen.css';

function ExportScreen({ navigate, data }) {
  const [allResults, setAllResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('fhir');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const results = await db.getAllResults();
      setAllResults(results.sort((a, b) => 
        new Date(b.screening_date) - new Date(a.screening_date)
      ));
      
      // If a specific result was passed, pre-select it
      if (data?.result) {
        setSelectedResults([data.result.id]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading results:', error);
      setLoading(false);
    }
  };

  const toggleResultSelection = (resultId) => {
    setSelectedResults(prev => 
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const selectAll = () => {
    setSelectedResults(allResults.map(r => r.id));
  };

  const deselectAll = () => {
    setSelectedResults([]);
  };

  const generateFHIRBundle = (results) => {
    const timestamp = new Date().toISOString();
    
    return {
      resourceType: "Bundle",
      id: `bundle-${Date.now()}`,
      type: "collection",
      timestamp: timestamp,
      entry: results.flatMap(result => [
        // Patient Resource
        {
          fullUrl: `urn:uuid:patient-${result.child_id}`,
          resource: {
            resourceType: "Patient",
            id: result.child_id,
            identifier: [{
              system: "http://school.edu/students",
              value: result.child_id
            }],
            name: [{
              text: result.child_name,
              family: result.child_name.split(' ').pop(),
              given: result.child_name.split(' ').slice(0, -1)
            }],
            birthDate: result.date_of_birth,
            gender: result.gender || "unknown"
          }
        },
        // Vision Observation
        {
          fullUrl: `urn:uuid:vision-${result.id}`,
          resource: {
            resourceType: "Observation",
            id: `vision-${result.id}`,
            status: "final",
            category: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "exam",
                display: "Exam"
              }]
            }],
            code: {
              coding: [{
                system: "http://loinc.org",
                code: "70936-0",
                display: "Visual acuity"
              }],
              text: "Visual Acuity Test"
            },
            subject: {
              reference: `urn:uuid:patient-${result.child_id}`
            },
            effectiveDateTime: result.screening_date,
            performer: [{
              display: result.screener_name
            }],
            valueQuantity: {
              value: result.vision_result.logMAR,
              unit: "logMAR",
              system: "http://unitsofmeasure.org",
              code: "logMAR"
            },
            interpretation: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: result.vision_result.pass ? "N" : "A",
                display: result.vision_result.pass ? "Normal" : "Abnormal"
              }]
            }],
            note: [{
              text: `Snellen equivalent: ${result.vision_result.snellenEquivalent}. Pass threshold: ≤0.3 logMAR`
            }]
          }
        },
        // Hearing Observation
        {
          fullUrl: `urn:uuid:hearing-${result.id}`,
          resource: {
            resourceType: "Observation",
            id: `hearing-${result.id}`,
            status: "final",
            category: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "exam",
                display: "Exam"
              }]
            }],
            code: {
              coding: [{
                system: "http://loinc.org",
                code: "28615-3",
                display: "Audiology study"
              }],
              text: "Hearing Screening"
            },
            subject: {
              reference: `urn:uuid:patient-${result.child_id}`
            },
            effectiveDateTime: result.screening_date,
            performer: [{
              display: result.screener_name
            }],
            component: [
              {
                code: {
                  coding: [{
                    system: "http://loinc.org",
                    code: "89023-5",
                    display: "Hearing test 1000 Hz"
                  }]
                },
                valueBoolean: result.hearing_result.frequency_1000_hz
              },
              {
                code: {
                  coding: [{
                    system: "http://loinc.org",
                    code: "89024-3",
                    display: "Hearing test 2000 Hz"
                  }]
                },
                valueBoolean: result.hearing_result.frequency_2000_hz
              },
              {
                code: {
                  coding: [{
                    system: "http://loinc.org",
                    code: "89025-0",
                    display: "Hearing test 4000 Hz"
                  }]
                },
                valueBoolean: result.hearing_result.frequency_4000_hz
              }
            ],
            interpretation: [{
              coding: [{
                system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                code: result.hearing_result.pass ? "N" : "A",
                display: result.hearing_result.pass ? "Normal" : "Abnormal"
              }]
            }]
          }
        }
      ])
    };
  };

  const generateHL7Message = (result) => {
    const now = new Date();
    const msgTime = now.toISOString().replace(/[-:]/g, '').split('.')[0];
    const dob = result.date_of_birth.replace(/-/g, '');
    
    const segments = [];
    
    // MSH - Message Header
    segments.push(`MSH|^~\\&|SKIDS_EYEAR|${result.school_code}|EHR|HOSPITAL|${msgTime}||ORU^R01|MSG${Date.now()}|P|2.5`);
    
    // PID - Patient Identification
    segments.push(`PID|1||${result.child_id}^^^SCHOOL^MR||${result.child_name}||${dob}|${result.gender || 'U'}`);
    
    // OBR - Observation Request (Vision)
    segments.push(`OBR|1||VISION_${result.id}|70936-0^Visual Acuity^LN|||${msgTime}|||||||||${result.screener_name}`);
    
    // OBX - Observation Result (Vision)
    segments.push(`OBX|1|NM|70936-0^Visual Acuity^LN||${result.vision_result.logMAR}|logMAR|<=0.3|${result.vision_result.pass ? 'N' : 'A'}|||F`);
    
    // OBR - Observation Request (Hearing)
    segments.push(`OBR|2||HEARING_${result.id}|28615-3^Audiology Study^LN|||${msgTime}|||||||||${result.screener_name}`);
    
    // OBX - Observation Results (Hearing Frequencies)
    segments.push(`OBX|1|ST|89023-5^Hearing 1000Hz^LN||${result.hearing_result.frequency_1000_hz ? 'PASS' : 'FAIL'}||||${result.hearing_result.frequency_1000_hz ? 'N' : 'A'}|||F`);
    segments.push(`OBX|2|ST|89024-3^Hearing 2000Hz^LN||${result.hearing_result.frequency_2000_hz ? 'PASS' : 'FAIL'}||||${result.hearing_result.frequency_2000_hz ? 'N' : 'A'}|||F`);
    segments.push(`OBX|3|ST|89025-0^Hearing 4000Hz^LN||${result.hearing_result.frequency_4000_hz ? 'PASS' : 'FAIL'}||||${result.hearing_result.frequency_4000_hz ? 'N' : 'A'}|||F`);
    
    return segments.join('\r\n');
  };

  const generateCSV = (results) => {
    const headers = [
      'Student ID',
      'Student Name',
      'Date of Birth',
      'Gender',
      'Screening Date',
      'Screener Name',
      'School Code',
      'Vision Pass',
      'Visual Acuity (logMAR)',
      'Snellen Equivalent',
      'Hearing Pass',
      '1000 Hz',
      '2000 Hz',
      '4000 Hz',
      'Referral Needed'
    ];
    
    const rows = results.map(r => [
      r.child_id,
      r.child_name,
      r.date_of_birth,
      r.gender || '',
      r.screening_date,
      r.screener_name,
      r.school_code,
      r.vision_result.pass ? 'PASS' : 'REFER',
      r.vision_result.logMAR.toFixed(2),
      r.vision_result.snellenEquivalent,
      r.hearing_result.pass ? 'PASS' : 'REFER',
      r.hearing_result.frequency_1000_hz ? 'PASS' : 'FAIL',
      r.hearing_result.frequency_2000_hz ? 'PASS' : 'FAIL',
      r.hearing_result.frequency_4000_hz ? 'PASS' : 'FAIL',
      r.referral_needed ? 'YES' : 'NO'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (selectedResults.length === 0) {
      alert('Please select at least one result to export');
      return;
    }

    const resultsToExport = allResults.filter(r => selectedResults.includes(r.id));
    const timestamp = new Date().toISOString().split('T')[0];

    try {
      switch (exportFormat) {
        case 'fhir': {
          const fhirBundle = generateFHIRBundle(resultsToExport);
          const content = JSON.stringify(fhirBundle, null, 2);
          downloadFile(content, `screening-results-fhir-${timestamp}.json`, 'application/fhir+json');
          alert(`✅ Exported ${selectedResults.length} results as FHIR R4 bundle`);
          break;
        }
        
        case 'hl7': {
          const hl7Messages = resultsToExport.map(r => generateHL7Message(r)).join('\n\n');
          downloadFile(hl7Messages, `screening-results-hl7-${timestamp}.hl7`, 'text/plain');
          alert(`✅ Exported ${selectedResults.length} results as HL7 v2.5 messages`);
          break;
        }
        
        case 'csv': {
          const csv = generateCSV(resultsToExport);
          downloadFile(csv, `screening-results-${timestamp}.csv`, 'text/csv');
          alert(`✅ Exported ${selectedResults.length} results as CSV`);
          break;
        }
        
        default:
          alert('Unknown export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Export failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="screen">
        <div className="screen-content">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen export-screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate(data?.result ? 'results' : 'home')}>
          ←
        </button>
        <h1 className="screen-title">Export Results</h1>
      </div>

      <div className="screen-content">
        {allResults.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📤</div>
              <h3>No Results to Export</h3>
              <p>Complete some screenings first</p>
              <button className="button button-primary" onClick={() => navigate('home')}>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Export Format Selection */}
            <div className="card">
              <div className="card-header">📋 Select Export Format</div>
              <div className="format-options">
                <label className={`format-option ${exportFormat === 'fhir' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="fhir"
                    checked={exportFormat === 'fhir'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-content">
                    <div className="format-icon">🏥</div>
                    <div className="format-details">
                      <div className="format-name">FHIR R4</div>
                      <div className="format-desc">HL7 FHIR (JSON Bundle)</div>
                      <div className="format-tech">Healthcare interoperability standard</div>
                    </div>
                  </div>
                </label>

                <label className={`format-option ${exportFormat === 'hl7' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="hl7"
                    checked={exportFormat === 'hl7'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-content">
                    <div className="format-icon">📨</div>
                    <div className="format-details">
                      <div className="format-name">HL7 v2.5</div>
                      <div className="format-desc">Legacy message format</div>
                      <div className="format-tech">Pipe-delimited ORU^R01 messages</div>
                    </div>
                  </div>
                </label>

                <label className={`format-option ${exportFormat === 'csv' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-content">
                    <div className="format-icon">📊</div>
                    <div className="format-details">
                      <div className="format-name">CSV</div>
                      <div className="format-desc">Comma-separated values</div>
                      <div className="format-tech">Excel, Google Sheets compatible</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Result Selection */}
            <div className="card">
              <div className="card-header">
                ✅ Select Results ({selectedResults.length} / {allResults.length} selected)
                <div className="selection-actions">
                  <button className="link-button" onClick={selectAll}>All</button>
                  <button className="link-button" onClick={deselectAll}>None</button>
                </div>
              </div>
              <div className="results-list">
                {allResults.map(result => (
                  <label key={result.id} className="result-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.id)}
                      onChange={() => toggleResultSelection(result.id)}
                    />
                    <div className="result-info-compact">
                      <div className="result-name">{result.child_name}</div>
                      <div className="result-meta">
                        {new Date(result.screening_date).toLocaleDateString()} •
                        {result.referral_needed ? ' ⚠️ Referral' : ' ✅ Pass'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="actions">
              <button
                className="button button-primary button-large"
                onClick={handleExport}
                disabled={selectedResults.length === 0}
              >
                📤 Export {selectedResults.length} Result{selectedResults.length !== 1 ? 's' : ''} as {exportFormat.toUpperCase()}
              </button>
              <button
                className="button button-secondary"
                onClick={() => navigate(data?.result ? 'results' : 'home')}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExportScreen;
