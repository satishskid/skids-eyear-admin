import React, { useState, useEffect } from 'react';
import { db } from '../services/indexedDB';
import { LocalAnalytics, AnalyticsExporter } from '../services/cloudAnalytics';
import './AnalyticsDashboard.css';

function AnalyticsDashboard({ navigate }) {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'week'
  const [selectedMetric, setSelectedMetric] = useState('overview'); // 'overview', 'hearing', 'vision', 'trends'

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Get all results from IndexedDB
    const allResults = await db.getAllResults();
    
    // Filter by period
    const filtered = filterByPeriod(allResults, selectedPeriod);
    setResults(filtered);
    
    // Calculate analytics
    if (filtered.length > 0) {
      const localAnalytics = new LocalAnalytics(filtered);
      const report = localAnalytics.generateReport();
      setAnalytics(report);
    } else {
      setAnalytics(null);
    }
    
    setLoading(false);
  };

  const filterByPeriod = (results, period) => {
    if (period === 'all') return results;
    
    const now = new Date();
    const cutoff = new Date();
    
    if (period === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    }
    
    return results.filter(r => new Date(r.screening_date) >= cutoff);
  };

  const handleExportCSV = () => {
    const csv = AnalyticsExporter.exportCSV(results);
    AnalyticsExporter.download(
      csv, 
      `screening-data-${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
  };

  const handleExportJSON = () => {
    const json = AnalyticsExporter.exportJSON(analytics);
    AnalyticsExporter.download(
      json,
      `analytics-report-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  if (loading) {
    return (
      <div className="screen analytics-dashboard">
        <div className="screen-header">
          <button className="back-button" onClick={() => navigate('home')}>←</button>
          <h1 className="screen-title">Analytics Dashboard</h1>
        </div>
        <div className="screen-content">
          <div className="loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="screen analytics-dashboard">
        <div className="screen-header">
          <button className="back-button" onClick={() => navigate('home')}>←</button>
          <h1 className="screen-title">Analytics Dashboard</h1>
        </div>
        <div className="screen-content">
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h2>No Data Available</h2>
              <p>Complete some screenings to see analytics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen analytics-dashboard">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>←</button>
        <h1 className="screen-title">📊 Analytics Dashboard</h1>
      </div>

      <div className="screen-content">
        {/* Period Selector */}
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Last Month
          </button>
          <button 
            className={selectedPeriod === 'all' ? 'active' : ''}
            onClick={() => setSelectedPeriod('all')}
          >
            All Time
          </button>
        </div>

        {/* Metric Tabs */}
        <div className="metric-tabs">
          <button
            className={selectedMetric === 'overview' ? 'active' : ''}
            onClick={() => setSelectedMetric('overview')}
          >
            Overview
          </button>
          <button
            className={selectedMetric === 'hearing' ? 'active' : ''}
            onClick={() => setSelectedMetric('hearing')}
          >
            Hearing
          </button>
          <button
            className={selectedMetric === 'vision' ? 'active' : ''}
            onClick={() => setSelectedMetric('vision')}
          >
            Vision
          </button>
          <button
            className={selectedMetric === 'trends' ? 'active' : ''}
            onClick={() => setSelectedMetric('trends')}
          >
            Trends
          </button>
        </div>

        {/* Overview Metrics */}
        {selectedMetric === 'overview' && (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-value">{analytics.overall.total}</div>
              <div className="metric-label">Total Screenings</div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👁️</div>
              <div className="metric-value">{analytics.overall.visionPassRate}%</div>
              <div className="metric-label">Vision Pass Rate</div>
              <div className="metric-trend positive">
                {100 - parseFloat(analytics.overall.visionPassRate)}% refer rate
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👂</div>
              <div className="metric-value">{analytics.overall.hearingPassRate}%</div>
              <div className="metric-label">Hearing Pass Rate</div>
              <div className="metric-trend positive">
                {100 - parseFloat(analytics.overall.hearingPassRate)}% refer rate
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div className="metric-value">{analytics.overall.referralRate}%</div>
              <div className="metric-label">Overall Referral Rate</div>
            </div>
          </div>
        )}

        {/* Hearing Frequency Analysis */}
        {selectedMetric === 'hearing' && (
          <div className="frequency-analysis">
            <h2 className="section-title">Hearing Frequency Analysis</h2>
            
            {Object.entries(analytics.hearingFrequencies).map(([freq, data]) => {
              const percentage = parseFloat(data.passRate) || 0;
              return (
                <div key={freq} className="frequency-bar-chart">
                  <div className="frequency-info">
                    <span className="frequency-label">{freq}</span>
                    <span className="frequency-stats">
                      {data.pass}/{data.total} passed ({data.passRate}%)
                    </span>
                  </div>
                  <div className="progress-bar-large">
                    <div 
                      className="progress-fill-large"
                      style={{ 
                        width: `${percentage}%`,
                        background: percentage >= 90 ? '#10b981' : 
                                    percentage >= 75 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}

            <div className="frequency-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#10b981' }}></span>
                <span>Excellent (≥90%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#f59e0b' }}></span>
                <span>Good (75-89%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#ef4444' }}></span>
                <span>Concerning (&lt;75%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Age Distribution */}
        {selectedMetric === 'vision' && (
          <div className="age-distribution">
            <h2 className="section-title">Age Group Distribution</h2>
            <div className="age-chart">
              {Object.entries(analytics.ageDistribution).map(([age, count]) => {
                const maxCount = Math.max(...Object.values(analytics.ageDistribution));
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={age} className="age-bar">
                    <div className="age-label">{age}</div>
                    <div className="age-bar-container">
                      <div 
                        className="age-bar-fill"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="age-count">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Temporal Trends */}
        {selectedMetric === 'trends' && (
          <div className="temporal-trends">
            <h2 className="section-title">Monthly Trends</h2>
            <div className="trend-list">
              {Object.entries(analytics.temporalTrends)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 12)
                .map(([month, data]) => (
                  <div key={month} className="trend-item">
                    <div className="trend-month">{month}</div>
                    <div className="trend-stats">
                      <span className="trend-total">{data.total} screenings</span>
                      <span className="trend-referrals">
                        {data.referrals} referrals ({data.referralRate}%)
                      </span>
                    </div>
                    <div className="trend-bar">
                      <div 
                        className="trend-bar-fill"
                        style={{ 
                          width: `${data.referralRate}%`,
                          background: parseFloat(data.referralRate) > 20 ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="export-section">
          <h3>Export Data</h3>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              📊 Export CSV
            </button>
            <button className="btn btn-secondary" onClick={handleExportJSON}>
              📄 Export JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
