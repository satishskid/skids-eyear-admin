import React, { useState, useEffect } from 'react';
import { db } from '../services/indexedDB';
import VisionReport from '../components/VisionReport';
import './ResultsScreen.css';

function ResultsScreen({ navigate, data }) {
  const [allResults, setAllResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVisionReport, setShowVisionReport] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const results = await db.getAllResults();
      setAllResults(results.sort((a, b) => 
        new Date(b.screening_date) - new Date(a.screening_date)
      ));
      setLoading(false);
    } catch (error) {
      console.error('Error loading results:', error);
      setLoading(false);
    }
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
  };

  const handleBack = () => {
    if (selectedResult) {
      setSelectedResult(null);
    } else {
      navigate('home');
    }
  };

  const handleDelete = async (resultId) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    
    try {
      await db.deleteResult(resultId);
      await loadResults();
      setSelectedResult(null);
      alert('Result deleted successfully');
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Failed to delete result');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewVisionReport = (result) => {
    setSelectedResult(result);
    setShowVisionReport(true);
  };

  const handleCloseVisionReport = () => {
    setShowVisionReport(false);
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

  if (selectedResult) {
    return (
      <div className="screen results-screen">
        <div className="screen-header">
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
          <h1 className="screen-title">Screening Results</h1>
        </div>

        <div className="screen-content">
          {/* Overall Result Badge */}
          <div className={`overall-badge ${!selectedResult.referral_needed ? 'pass' : 'refer'}`}>
            {!selectedResult.referral_needed ? '✅ PASSED SCREENING' : '⚠️ REFERRAL RECOMMENDED'}
          </div>

          {/* Student Info */}
          <div className="card">
            <div className="card-header">👤 Student Information</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{selectedResult.child_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{selectedResult.child_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Age:</span>
                <span className="info-value">{calculateAge(selectedResult.date_of_birth)} years</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{formatDate(selectedResult.screening_date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Screener:</span>
                <span className="info-value">{selectedResult.screener_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">School:</span>
                <span className="info-value">{selectedResult.school_code}</span>
              </div>
            </div>
          </div>

          {/* Vision Results */}
          <div className="card">
            <div className="card-header">
              👁️ Vision Test Results
              <span className={`test-badge ${selectedResult.vision_result.pass ? 'pass' : 'refer'}`}>
                {selectedResult.vision_result.pass ? 'PASS' : 'REFER'}
              </span>
            </div>
            <div className="result-details">
              <div className="result-row">
                <span className="result-label">Visual Acuity:</span>
                <span className="result-value">
                  {selectedResult.vision_result.logMAR.toFixed(1)} logMAR
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">Snellen Equivalent:</span>
                <span className="result-value">
                  {selectedResult.vision_result.snellenEquivalent}
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">Trials Completed:</span>
                <span className="result-value">
                  {selectedResult.vision_result.trialsCompleted}
                </span>
              </div>
              <div className="result-row">
                <span className="result-label">Reversals:</span>
                <span className="result-value">
                  {selectedResult.vision_result.reversals}
                </span>
              </div>
              <div className="result-note">
                Pass criteria: ≤0.3 logMAR (20/40 Snellen)
              </div>
            </div>
          </div>

          {/* Hearing Results */}
          <div className="card">
            <div className="card-header">
              👂 Hearing Test Results
              <span className={`test-badge ${selectedResult.hearing_result.pass ? 'pass' : 'refer'}`}>
                {selectedResult.hearing_result.pass ? 'PASS' : 'REFER'}
              </span>
            </div>
            <div className="result-details">
              <div className="frequency-results">
                <div className={`frequency-item ${selectedResult.hearing_result.frequency_1000_hz ? 'detected' : 'missed'}`}>
                  <span className="freq-icon">🐕</span>
                  <span className="freq-name">Dog (1000 Hz)</span>
                  <span className="freq-status">
                    {selectedResult.hearing_result.frequency_1000_hz ? '✅' : '❌'}
                  </span>
                </div>
                <div className={`frequency-item ${selectedResult.hearing_result.frequency_2000_hz ? 'detected' : 'missed'}`}>
                  <span className="freq-icon">🐦</span>
                  <span className="freq-name">Bird (2000 Hz)</span>
                  <span className="freq-status">
                    {selectedResult.hearing_result.frequency_2000_hz ? '✅' : '❌'}
                  </span>
                </div>
                <div className={`frequency-item ${selectedResult.hearing_result.frequency_4000_hz ? 'detected' : 'missed'}`}>
                  <span className="freq-icon">🔔</span>
                  <span className="freq-name">Bell (4000 Hz)</span>
                  <span className="freq-status">
                    {selectedResult.hearing_result.frequency_4000_hz ? '✅' : '❌'}
                  </span>
                </div>
              </div>
              <div className="result-note">
                Pass criteria: All frequencies detected correctly
              </div>
            </div>
          </div>

          {/* Referral Recommendations */}
          {selectedResult.referral_needed && (
            <div className="card referral-card">
              <div className="card-header">⚠️ Referral Recommendations</div>
              <div className="referral-content">
                <p><strong>This student should be referred for:</strong></p>
                <ul>
                  {!selectedResult.vision_result.pass && (
                    <li>
                      <strong>Vision:</strong> Comprehensive eye examination by optometrist or ophthalmologist
                      <div className="reason">
                        Visual acuity {selectedResult.vision_result.logMAR.toFixed(1)} logMAR exceeds screening threshold
                      </div>
                    </li>
                  )}
                  {!selectedResult.hearing_result.pass && (
                    <li>
                      <strong>Hearing:</strong> Complete audiological evaluation
                      <div className="reason">
                        Failed to detect one or more test frequencies
                      </div>
                    </li>
                  )}
                </ul>
                <p className="referral-note">
                  <strong>Next Steps:</strong> Notify parent/guardian and provide referral information
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            <button
              className="button button-primary"
              onClick={() => navigate('export', { result: selectedResult })}
            >
              📤 Export Results
            </button>
            <button
              className="button button-secondary"
              onClick={() => navigate('home')}
            >
              🏠 Back to Home
            </button>
            <button
              className="button button-danger"
              onClick={() => handleDelete(selectedResult.id)}
            >
              🗑️ Delete Result
            </button>
            <button
              className="button button-secondary"
              onClick={() => handleViewVisionReport(selectedResult)}
            >
              📊 View Vision Report
            </button>
          </div>
        </div>
        {showVisionReport && (
          <VisionReport
            result={selectedResult}
            onClose={handleCloseVisionReport}
          />
        )}
      </div>
    );
  }

  // Results List View
  return (
    <div className="screen results-screen">
      <div className="screen-header">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>
        <h1 className="screen-title">All Results</h1>
      </div>

      <div className="screen-content">
        {allResults.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Results Yet</h3>
              <p>Complete a screening to see results here</p>
              <button
                className="button button-primary"
                onClick={() => navigate('home')}
              >
                Start Screening
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="results-stats">
              <div className="stat-item">
                <div className="stat-number">{allResults.length}</div>
                <div className="stat-label">Total Screenings</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {allResults.filter(r => !r.referral_needed).length}
                </div>
                <div className="stat-label">Passed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {allResults.filter(r => r.referral_needed).length}
                </div>
                <div className="stat-label">Referrals</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  {allResults.filter(r => !r.synced).length}
                </div>
                <div className="stat-label">Unsynced</div>
              </div>
            </div>

            <div className="results-list">
              {allResults.map(result => (
                <div
                  key={result.id}
                  className="result-card"
                  onClick={() => handleViewResult(result)}
                >
                  <div className="result-card-header">
                    <div className="student-name">{result.child_name}</div>
                    <div className={`status-badge ${!result.referral_needed ? 'pass' : 'refer'}`}>
                      {!result.referral_needed ? '✅ Pass' : '⚠️ Refer'}
                    </div>
                  </div>
                  <div className="result-card-body">
                    <div className="result-info">
                      <span className="result-date">
                        📅 {formatDate(result.screening_date)}
                      </span>
                      <span className="result-detail">
                        👁️ {result.vision_result.snellenEquivalent}
                      </span>
                      <span className="result-detail">
                        👂 {result.hearing_result.correctCount}/3 sounds
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultsScreen;
