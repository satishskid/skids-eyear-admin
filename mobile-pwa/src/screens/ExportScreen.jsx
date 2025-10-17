import React from 'react';

function ExportScreen({ navigate, data }) {
  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>←</button>
        <h1 className="screen-title">Export Data</h1>
      </div>
      <div className="screen-content">
        <p>Export functionality coming soon...</p>
        <button className="button button-primary" onClick={() => navigate('home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ExportScreen;
