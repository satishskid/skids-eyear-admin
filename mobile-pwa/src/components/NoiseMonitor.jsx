import React from 'react';
import './NoiseMonitor.css';

function NoiseMonitor({ noiseLevel, threshold = 40, acceptable }) {
  const percentage = Math.min((noiseLevel / 60) * 100, 100); // Max 60 dB for display
  
  const getStatusColor = () => {
    if (acceptable) return '#10b981'; // Green
    if (noiseLevel < threshold + 5) return '#f59e0b'; // Amber warning
    return '#ef4444'; // Red
  };

  const getStatusText = () => {
    if (acceptable) return '✅ Environment Suitable';
    if (noiseLevel < threshold + 5) return '⚠️ Noise Elevated';
    return '❌ Too Noisy - Find Quieter Location';
  };

  return (
    <div className="noise-monitor">
      <div className="noise-header">
        <span className="noise-icon">🔊</span>
        <span className="noise-title">Ambient Noise Monitor</span>
      </div>
      
      <div className="noise-meter">
        <div 
          className="noise-fill" 
          style={{ 
            width: `${percentage}%`,
            background: getStatusColor()
          }}
        ></div>
        <div 
          className="noise-threshold-marker" 
          style={{ left: `${(threshold / 60) * 100}%` }}
        >
          <div className="marker-line"></div>
          <div className="marker-label">{threshold} dB</div>
        </div>
      </div>
      
      <div className="noise-info">
        <div className="noise-level">
          <span className="level-value">{noiseLevel}</span>
          <span className="level-unit">dB SPL</span>
        </div>
        <div 
          className="noise-status" 
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </div>
      </div>
      
      {!acceptable && (
        <div className="noise-warning">
          <p>
            <strong>Recommendation:</strong> Move to a quieter area or reduce background noise.
            High ambient noise can interfere with test accuracy.
          </p>
        </div>
      )}
    </div>
  );
}

export default NoiseMonitor;
