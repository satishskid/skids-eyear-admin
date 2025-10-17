import React, { useState, useEffect } from 'react';
import deviceCalibration from '../services/deviceCalibration';
import './CalibrationScreen.css';

function CalibrationScreen({ navigate }) {
  const [step, setStep] = useState('select'); // 'select', 'test', 'complete'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detectedDevices, setDetectedDevices] = useState([]);
  const [biologicalTest, setBiologicalTest] = useState({
    500: null,
    1000: null,
    2000: null,
    4000: null,
    8000: null
  });
  const [currentTestFreq, setCurrentTestFreq] = useState(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [calibrationSummary, setCalibrationSummary] = useState(null);

  useEffect(() => {
    // Load existing calibration
    deviceCalibration.loadFromLocalStorage();
    const summary = deviceCalibration.getCalibrationSummary();
    setCalibrationSummary(summary);

    // Detect connected audio devices
    detectAudioDevices();
  }, []);

  const detectAudioDevices = async () => {
    const devices = await deviceCalibration.detectAudioDevices();
    setDetectedDevices(devices);

    // Auto-suggest profile based on device name
    if (devices.length > 0) {
      const suggested = deviceCalibration.autoDetectHeadphone(devices[0].label);
      setSelectedProfile(suggested);
    }
  };

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
    deviceCalibration.selectHeadphone(profileId);
  };

  const handleSkipCalibration = () => {
    navigate('home');
  };

  const startBiologicalCalibration = () => {
    setStep('test');
    setCurrentTestFreq(500);
  };

  const playTestTone = async () => {
    setIsPlaying(true);
    
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    // Get current calibrated gain
    const gain = deviceCalibration.getCalibratedGain(currentTestFreq);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(currentTestFreq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    oscillator.stop();
    await audioContext.close();
    
    setIsPlaying(false);
  };

  const recordResponse = (response) => {
    setBiologicalTest({
      ...biologicalTest,
      [currentTestFreq]: response
    });

    // Move to next frequency
    const frequencies = [500, 1000, 2000, 4000, 8000];
    const currentIndex = frequencies.indexOf(currentTestFreq);
    
    if (currentIndex < frequencies.length - 1) {
      setCurrentTestFreq(frequencies[currentIndex + 1]);
    } else {
      // Complete calibration
      completeBiologicalCalibration();
    }
  };

  const completeBiologicalCalibration = async () => {
    await deviceCalibration.performBiologicalCalibration(biologicalTest);
    setStep('complete');
  };

  const profiles = deviceCalibration.getHeadphoneProfiles();
  const consumerProfiles = profiles.filter(p => !p.clinical);
  const clinicalProfiles = profiles.filter(p => p.clinical);

  if (step === 'complete') {
    return (
      <div className="screen calibration-screen">
        <div className="screen-header">
          <h1 className="screen-title">✅ Calibration Complete</h1>
        </div>

        <div className="screen-content">
          <div className="card">
            <div className="success-icon">🎧</div>
            <h2 className="success-title">Your Device is Calibrated</h2>
            <p className="success-message">
              The hearing test is now optimized for your headphones and device.
              You can proceed to start screening.
            </p>

            <div className="calibration-info">
              <h3>Calibration Summary</h3>
              {calibrationSummary?.headphone && (
                <div className="info-row">
                  <span className="info-label">Headphone:</span>
                  <span className="info-value">{calibrationSummary.headphone.name}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Device:</span>
                <span className="info-value">{calibrationSummary?.device?.name || 'Unknown'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Accuracy:</span>
                <span className="info-value">
                  {calibrationSummary?.headphone?.validated ? '±2 dB (Validated)' : '±3 dB (Generic)'}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-block"
              onClick={() => navigate('home')}
            >
              Continue to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'test') {
    const frequencies = [500, 1000, 2000, 4000, 8000];
    const currentIndex = frequencies.indexOf(currentTestFreq);
    const progress = ((currentIndex + 1) / frequencies.length) * 100;

    return (
      <div className="screen calibration-screen">
        <div className="screen-header">
          <button className="back-button" onClick={() => setStep('select')}>←</button>
          <h1 className="screen-title">Biological Calibration</h1>
        </div>

        <div className="screen-content">
          <div className="card">
            <div className="calibration-progress">
              <div className="progress-text">
                Testing {currentTestFreq} Hz ({currentIndex + 1} of {frequencies.length})
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="test-instructions">
              <h3>📢 Listen to the tone</h3>
              <p>
                Put on your headphones and click "Play Test Tone". 
                Tell us if the volume is comfortable.
              </p>
            </div>

            <div className="test-controls">
              <button 
                className="btn btn-primary btn-lg"
                onClick={playTestTone}
                disabled={isPlaying}
              >
                {isPlaying ? '🔊 Playing...' : '▶️ Play Test Tone'}
              </button>
            </div>

            <div className="response-buttons">
              <p className="response-prompt">How was the volume?</p>
              <div className="response-grid">
                <button 
                  className="response-btn too-soft"
                  onClick={() => recordResponse({ comfortable: false, tooLoud: false })}
                >
                  🔇 Too Soft
                </button>
                <button 
                  className="response-btn just-right"
                  onClick={() => recordResponse({ comfortable: true, tooLoud: false })}
                >
                  ✅ Just Right
                </button>
                <button 
                  className="response-btn too-loud"
                  onClick={() => recordResponse({ comfortable: false, tooLoud: true })}
                >
                  🔊 Too Loud
                </button>
              </div>
            </div>

            <div className="help-text">
              💡 Choose "Just Right" if the tone is soft but clearly audible
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen calibration-screen">
      <div className="screen-header">
        <button className="back-button" onClick={handleSkipCalibration}>←</button>
        <h1 className="screen-title">Device Calibration</h1>
      </div>

      <div className="screen-content">
        <div className="card">
          <div className="card-header">🎧 Select Your Headphones</div>
          <p className="calibration-intro">
            For accurate hearing screening, please select your headphone model. 
            This ensures consistent test results across different devices.
          </p>

          {/* Detected Devices */}
          {detectedDevices.length > 0 && (
            <div className="detected-devices">
              <h3>🔍 Detected Audio Devices</h3>
              {detectedDevices.map((device, index) => (
                <div key={index} className="device-item">
                  <span className="device-icon">🎧</span>
                  <span className="device-label">{device.label || 'Unknown Device'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Clinical Headphones */}
          {clinicalProfiles.length > 0 && (
            <div className="profile-section">
              <h3>🏥 Clinical/Professional Headphones</h3>
              <div className="profile-grid">
                {clinicalProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
                    onClick={() => handleProfileSelect(profile.id)}
                  >
                    <div className="profile-header">
                      <span className="profile-name">{profile.name}</span>
                      {profile.validated && <span className="validated-badge">✓ Validated</span>}
                    </div>
                    <div className="profile-specs">
                      <span className="spec-item">{profile.impedance}Ω</span>
                      <span className="spec-item">{profile.sensitivity} dB SPL/mW</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Consumer Headphones */}
          <div className="profile-section">
            <h3>🎵 Consumer Headphones</h3>
            <div className="profile-grid">
              {consumerProfiles.map((profile) => (
                <button
                  key={profile.id}
                  className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
                  onClick={() => handleProfileSelect(profile.id)}
                >
                  <div className="profile-header">
                    <span className="profile-name">{profile.name}</span>
                    {profile.validated && <span className="validated-badge">✓ Validated</span>}
                  </div>
                  <div className="profile-specs">
                    <span className="spec-item">{profile.impedance}Ω</span>
                    <span className="spec-item">{profile.sensitivity} dB SPL/mW</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              disabled={!selectedProfile}
              onClick={() => {
                setStep('complete');
                const summary = deviceCalibration.getCalibrationSummary();
                setCalibrationSummary(summary);
              }}
            >
              Use Selected Profile
            </button>
            <button 
              className="btn btn-secondary"
              onClick={startBiologicalCalibration}
            >
              Custom Calibration (Advanced)
            </button>
          </div>

          <div className="skip-option">
            <button className="btn-link" onClick={handleSkipCalibration}>
              Skip calibration (not recommended)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalibrationScreen;
