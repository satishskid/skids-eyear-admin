import React from 'react';
import './VisionReport.css';

/**
 * Comprehensive Vision Screening Report Component
 * Similar to professional optometry reports with eye diagrams and detailed metrics
 */
function VisionReport({ result, onClose, onExport }) {
  // Calculate derived metrics
  const calculateSnellenFeet = (logmar) => {
    const denominator = Math.round(20 * Math.pow(10, logmar));
    return `20/${denominator}`;
  };

  const calculateSnellenMeters = (logmar) => {
    const denominator = Math.round(6 * Math.pow(10, logmar));
    return `6/${denominator}`;
  };

  const getVisualAcuityCategory = (logmar) => {
    if (logmar <= 0.0) return { category: 'Normal', color: '#10b981' };
    if (logmar <= 0.3) return { category: 'Borderline', color: '#f59e0b' };
    if (logmar <= 0.5) return { category: 'Mild Impairment', color: '#f59e0b' };
    if (logmar <= 0.7) return { category: 'Moderate Impairment', color: '#ef4444' };
    return { category: 'Severe Impairment', color: '#dc2626' };
  };

  const vaCategory = getVisualAcuityCategory(result.vision_result.logMAR);
  const screeningDate = new Date(result.screening_date);

  return (
    <div className="vision-report-overlay">
      <div className="vision-report-container">
        <div className="report-header">
          <div className="report-title-section">
            <h2 className="report-title">Vision Screening Report</h2>
            <div className="report-meta">
              <span>📅 {screeningDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span>•</span>
              <span>👤 {result.child_name}</span>
            </div>
          </div>
          <button className="report-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="report-content">
          {/* Patient Information Card */}
          <div className="report-card patient-info-card">
            <h3 className="card-title">Patient Information</h3>
            <div className="info-grid-3col">
              <div className="info-item">
                <span className="info-label">Student ID</span>
                <span className="info-value">{result.child_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{result.child_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">
                  {new Date(result.date_of_birth).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">
                  {Math.floor((new Date() - new Date(result.date_of_birth)) / 31557600000)} years
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">School</span>
                <span className="info-value">{result.school_code}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Screener</span>
                <span className="info-value">{result.screener_name}</span>
              </div>
            </div>
          </div>

          {/* Eye Diagrams Section */}
          <div className="report-card eye-diagrams-card">
            <h3 className="card-title">Visual Acuity Assessment</h3>
            
            <div className="eyes-diagram-container">
              {/* Left Eye (OD) */}
              <div className="eye-diagram-section">
                <div className="eye-label-header">
                  <span className="eye-abbreviation">OD</span>
                  <span className="eye-fullname">Right Eye</span>
                </div>
                
                <div className="eye-illustration">
                  <svg viewBox="0 0 200 120" className="eye-svg">
                    {/* Eye shape */}
                    <ellipse cx="100" cy="60" rx="80" ry="40" fill="#f0f0f0" stroke="#666" strokeWidth="2"/>
                    
                    {/* Iris */}
                    <circle cx="100" cy="60" r="30" fill="#7aa8c4" stroke="#333" strokeWidth="2"/>
                    
                    {/* Pupil */}
                    <circle cx="100" cy="60" r="15" fill="#1a1a1a"/>
                    
                    {/* Highlight */}
                    <circle cx="90" cy="50" r="5" fill="white" opacity="0.8"/>
                    
                    {/* Visual acuity indicator lines */}
                    <g className="acuity-lines">
                      <line x1="40" y1="20" x2="50" y2="15" stroke="#666" strokeWidth="1.5"/>
                      <line x1="160" y1="20" x2="150" y2="15" stroke="#666" strokeWidth="1.5"/>
                      <text x="35" y="15" fontSize="10" fill="#666">6.4</text>
                      <text x="163" y="15" fontSize="10" fill="#666">6.2</text>
                    </g>
                  </svg>
                </div>

                <div className="eye-metrics-box">
                  <div className="metric-row">
                    <span className="metric-label">Sphere:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Cylinder:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Axis:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row-highlight">
                    <span className="metric-label">VA:</span>
                    <span className="metric-value-large">
                      {calculateSnellenFeet(result.vision_result.logMAR)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Eye (OS) */}
              <div className="eye-diagram-section">
                <div className="eye-label-header">
                  <span className="eye-abbreviation">OS</span>
                  <span className="eye-fullname">Left Eye</span>
                </div>
                
                <div className="eye-illustration">
                  <svg viewBox="0 0 200 120" className="eye-svg">
                    {/* Eye shape */}
                    <ellipse cx="100" cy="60" rx="80" ry="40" fill="#f0f0f0" stroke="#666" strokeWidth="2"/>
                    
                    {/* Iris */}
                    <circle cx="100" cy="60" r="30" fill="#7aa8c4" stroke="#333" strokeWidth="2"/>
                    
                    {/* Pupil */}
                    <circle cx="100" cy="60" r="15" fill="#1a1a1a"/>
                    
                    {/* Highlight */}
                    <circle cx="110" cy="50" r="5" fill="white" opacity="0.8"/>
                    
                    {/* Visual acuity indicator lines */}
                    <g className="acuity-lines">
                      <line x1="40" y1="20" x2="50" y2="15" stroke="#666" strokeWidth="1.5"/>
                      <line x1="160" y1="20" x2="150" y2="15" stroke="#666" strokeWidth="1.5"/>
                      <text x="35" y="15" fontSize="10" fill="#666">5.4</text>
                      <text x="163" y="15" fontSize="10" fill="#666">6.2</text>
                    </g>
                  </svg>
                </div>

                <div className="eye-metrics-box">
                  <div className="metric-row">
                    <span className="metric-label">Sphere:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Cylinder:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Axis:</span>
                    <span className="metric-value">-</span>
                  </div>
                  <div className="metric-row-highlight">
                    <span className="metric-label">VA:</span>
                    <span className="metric-value-large">
                      {calculateSnellenFeet(result.vision_result.logMAR)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Both Eyes Combined Section */}
            <div className="both-eyes-section">
              <div className="both-eyes-header">BOTH EYES</div>
              <div className="binocular-metrics">
                <div className="binocular-metric">
                  <div className="metric-icon">👁️</div>
                  <div className="metric-name">Binocular VA</div>
                  <div className="metric-value-hero">
                    {calculateSnellenFeet(result.vision_result.logMAR)}
                  </div>
                  <div className="metric-subtitle">
                    ({result.vision_result.logMAR.toFixed(2)} logMAR)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Acuity Details */}
          <div className="report-card va-details-card">
            <h3 className="card-title">Visual Acuity Metrics</h3>
            
            <div className="va-metrics-grid">
              <div className="va-metric-item">
                <div className="va-metric-label">logMAR</div>
                <div className="va-metric-value" style={{ color: vaCategory.color }}>
                  {result.vision_result.logMAR.toFixed(2)}
                </div>
                <div className="va-metric-note">Logarithm of Minimum Angle of Resolution</div>
              </div>

              <div className="va-metric-item">
                <div className="va-metric-label">Snellen (Feet)</div>
                <div className="va-metric-value">
                  {calculateSnellenFeet(result.vision_result.logMAR)}
                </div>
                <div className="va-metric-note">US Standard</div>
              </div>

              <div className="va-metric-item">
                <div className="va-metric-label">Snellen (Meters)</div>
                <div className="va-metric-value">
                  {calculateSnellenMeters(result.vision_result.logMAR)}
                </div>
                <div className="va-metric-note">International Standard</div>
              </div>

              <div className="va-metric-item">
                <div className="va-metric-label">Category</div>
                <div className="va-metric-value" style={{ color: vaCategory.color }}>
                  {vaCategory.category}
                </div>
                <div className="va-metric-note">Vision Classification</div>
              </div>
            </div>
          </div>

          {/* Visual Field Representation */}
          <div className="report-card visual-field-card">
            <h3 className="card-title">Visual Field Assessment (Simulated)</h3>
            
            <div className="visual-field-container">
              {/* Right Eye Visual Field */}
              <div className="visual-field-section">
                <div className="field-label">RIGHT EYE</div>
                <div className="field-grid">
                  <div className="field-quadrant">
                    <div className="quadrant-label">OUT OF RANGE</div>
                    <div className="quadrant-bar" style={{ width: '20%', backgroundColor: '#fee2e2' }}></div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-label">IN RANGE</div>
                    <div className="quadrant-bar myopia" style={{ width: '70%', backgroundColor: '#3b82f6' }}>
                      <span className="bar-label">myopia</span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar hyperopia" style={{ width: '50%', backgroundColor: '#60a5fa' }}>
                      <span className="bar-label">hyperopia</span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar astigmatism" style={{ 
                      width: result.vision_result.pass ? '60%' : '85%', 
                      backgroundColor: result.vision_result.pass ? '#3b82f6' : '#ef4444' 
                    }}>
                      <span className="bar-label">
                        {result.vision_result.pass ? 'normal' : 'astigmatism'}
                      </span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar gaze-dev" style={{ width: '45%', backgroundColor: '#60a5fa' }}>
                      <span className="bar-label">gaze dev</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Eye Visual Field */}
              <div className="visual-field-section">
                <div className="field-label">LEFT EYE</div>
                <div className="field-grid">
                  <div className="field-quadrant">
                    <div className="quadrant-label">OUT OF RANGE</div>
                    <div className="quadrant-bar" style={{ width: '15%', backgroundColor: '#fee2e2' }}></div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-label">IN RANGE</div>
                    <div className="quadrant-bar myopia" style={{ width: '70%', backgroundColor: '#3b82f6' }}>
                      <span className="bar-label">myopia</span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar hyperopia" style={{ width: '48%', backgroundColor: '#60a5fa' }}>
                      <span className="bar-label">hyperopia</span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar astigmatism" style={{ 
                      width: result.vision_result.pass ? '55%' : '80%', 
                      backgroundColor: result.vision_result.pass ? '#3b82f6' : '#ef4444' 
                    }}>
                      <span className="bar-label">
                        {result.vision_result.pass ? 'normal' : 'astigmatism'}
                      </span>
                    </div>
                  </div>
                  <div className="field-quadrant">
                    <div className="quadrant-bar gaze-dev" style={{ width: '42%', backgroundColor: '#60a5fa' }}>
                      <span className="bar-label">gaze dev</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Protocol Details */}
          <div className="report-card protocol-card">
            <h3 className="card-title">Test Protocol & Results</h3>
            
            <div className="protocol-grid">
              <div className="protocol-item">
                <div className="protocol-label">Test Method</div>
                <div className="protocol-value">Tumbling E Chart</div>
              </div>
              <div className="protocol-item">
                <div className="protocol-label">Algorithm</div>
                <div className="protocol-value">logMAR Staircase</div>
              </div>
              <div className="protocol-item">
                <div className="protocol-label">Trials Completed</div>
                <div className="protocol-value">{result.vision_result.trialsCompleted}</div>
              </div>
              <div className="protocol-item">
                <div className="protocol-label">Reversals</div>
                <div className="protocol-value">{result.vision_result.reversals}</div>
              </div>
              <div className="protocol-item">
                <div className="protocol-label">Pass Threshold</div>
                <div className="protocol-value">≤ 0.3 logMAR (20/40)</div>
              </div>
              <div className="protocol-item">
                <div className="protocol-label">Test Result</div>
                <div className="protocol-value" style={{ 
                  color: result.vision_result.pass ? '#10b981' : '#ef4444',
                  fontWeight: 'bold'
                }}>
                  {result.vision_result.pass ? '✅ PASS' : '⚠️ REFER'}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {!result.vision_result.pass && (
            <div className="report-card recommendations-card">
              <h3 className="card-title">⚠️ Clinical Recommendations</h3>
              
              <div className="recommendations-content">
                <div className="recommendation-box warning">
                  <div className="recommendation-icon">🏥</div>
                  <div className="recommendation-text">
                    <h4>Referral Recommended</h4>
                    <p>
                      Visual acuity of {result.vision_result.logMAR.toFixed(2)} logMAR 
                      ({calculateSnellenFeet(result.vision_result.logMAR)}) exceeds the 
                      screening threshold of 0.3 logMAR (20/40 Snellen).
                    </p>
                  </div>
                </div>

                <div className="recommendation-box info">
                  <div className="recommendation-icon">👨‍⚕️</div>
                  <div className="recommendation-text">
                    <h4>Next Steps</h4>
                    <ul>
                      <li>Schedule comprehensive eye examination with optometrist or ophthalmologist</li>
                      <li>Notify parent/guardian of screening results</li>
                      <li>Provide referral documentation and contact information</li>
                      <li>Follow up to ensure appointment is scheduled</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="report-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Report
          </button>
          <button className="btn-primary" onClick={() => onExport && onExport(result)}>
            📄 Export as PDF
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisionReport;
