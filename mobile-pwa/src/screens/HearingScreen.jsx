import React from 'react';

function HearingScreen({ navigate, data }) {
  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('home')}>←</button>
        <h1 className="screen-title">Hearing Test</h1>
      </div>
      <div className="screen-content">
        <p>Hearing screening coming soon...</p>
        <button className="button button-primary" onClick={() => navigate('home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default HearingScreen;
