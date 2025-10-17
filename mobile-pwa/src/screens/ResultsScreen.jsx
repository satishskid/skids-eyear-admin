import React, { useState, useEffect } from 'react';
import { db } from '../services/indexedDB';

function ResultsScreen({ navigate, data }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const allResults = await db.getAllResults();
      setResults(allResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>←</button>
        <h1 className="screen-title">Results</h1>
      </div>
      <div className="screen-content">
        {loading ? (
          <p>Loading results...</p>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <p>No screening results yet</p>
            <button className="button button-primary" onClick={() => navigate('home')}>
              Start Screening
            </button>
          </div>
        ) : (
          <div>
            <p>Found {results.length} screening results</p>
            <button className="button button-primary" onClick={() => navigate('home')}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsScreen;
