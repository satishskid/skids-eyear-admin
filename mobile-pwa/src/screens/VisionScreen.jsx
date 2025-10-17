import React, { useState, useEffect } from 'react';
import './VisionScreen.css';

// Simple VisionEngine implementation for web
const LOGMAR_LEVELS = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const DIRECTIONS = ['up', 'down', 'left', 'right'];

class VisionEngine {
  constructor(age) {
    this.age = age;
    this.currentLevel = age <= 3 ? 7 : age <= 4 ? 5 : 3;
    this.reversals = 0;
    this.lastResponse = null;
    this.thresholdTrials = 0;
    this.responses = [];
  }

  getNextTrial() {
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const logmar = LOGMAR_LEVELS[this.currentLevel];
    return { direction, logmar };
  }

  recordResponse(isCorrect) {
    this.responses.push({ level: this.currentLevel, correct: isCorrect });

    if (this.lastResponse !== null && this.lastResponse !== isCorrect) {
      this.reversals++;
    }

    if (isCorrect && this.currentLevel > 0) this.currentLevel--;
    else if (!isCorrect && this.currentLevel < LOGMAR_LEVELS.length - 1) this.currentLevel++;

    this.lastResponse = isCorrect;
    this.thresholdTrials++;

    return this.reversals >= 4 || this.thresholdTrials >= 20;
  }

  getEstimatedVA() {
    if (this.responses.length < 6) return LOGMAR_LEVELS[this.currentLevel];
    const lastSix = this.responses.slice(-6);
    const avg = lastSix.reduce((sum, r) => sum + LOGMAR_LEVELS[r.level], 0) / lastSix.length;
    return Math.round(avg * 10) / 10;
  }
}

function VisionScreen({ navigate, data }) {
  const [engine, setEngine] = useState(null);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const age = calculateAge(data.child.date_of_birth);
    const visionEngine = new VisionEngine(age);
    setEngine(visionEngine);
  }, [data.child.date_of_birth]);

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

  const logmarToSnellen = (logmar) => {
    const snellenDenominator = Math.round(20 * Math.pow(10, logmar));
    return `20/${snellenDenominator}`;
  };

  const startTest = () => {
    setIsTestRunning(true);
    const trial = engine.getNextTrial();
    setCurrentTrial(trial);
    setFeedback('');
  };

  const handleResponse = (selectedDirection) => {
    if (!engine || !isTestRunning || !currentTrial) return;

    const isCorrect = selectedDirection === currentTrial.direction;
    setFeedback(isCorrect ? '✅ Correct!' : '❌ Incorrect');
    
    setTimeout(() => {
      const testFinished = engine.recordResponse(isCorrect);

      if (testFinished) {
        finishTest();
      } else {
        const nextTrial = engine.getNextTrial();
        setCurrentTrial(nextTrial);
        setFeedback('');
      }
    }, 500);
  };

  const finishTest = () => {
    const va = engine.getEstimatedVA();
    const pass = va <= 0.3;

    const visionResult = {
      logMAR: va,
      snellenEquivalent: logmarToSnellen(va),
      pass,
      trialsCompleted: engine.thresholdTrials,
      reversals: engine.reversals,
    };

    setResult(visionResult);
    setTestComplete(true);
    setIsTestRunning(false);
  };

  const handleContinue = () => {
    navigate('hearing', {
      ...data,
      visionResult: result
    });
  };

  const getSymbolSize = (logmar) => {
    const baseSize = 40;
    const size = baseSize * Math.pow(10, logmar);
    return Math.min(Math.max(size, 20), 300);
  };

  const renderE = (direction, size) => {
    const rotations = { up: 0, right: 90, down: 180, left: 270 };
    return (
      <div 
        className="tumbling-e"
        style={{
          fontSize: `${size}px`,
          transform: `rotate(${rotations[direction]}deg)`,
        }}
      >
        E
      </div>
    );
  };

  if (!engine) {
    return (
      <div className="screen">
        <div className="screen-content">
          <div className="spinner"></div>
          <p>Initializing vision test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen vision-screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('qr-scanner', data)}>
          ←
        </button>
        <h1 className="screen-title">Vision Test</h1>
      </div>

      <div className="screen-content">
        {!isTestRunning && !testComplete && (
          <div className="card">
            <div className="card-header">👁️ Visual Acuity Test</div>
            <p><strong>Student:</strong> {data.child.name}</p>
            <p><strong>Test:</strong> Tumbling E (logMAR staircase)</p>
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>Position student 4 meters from screen</li>
              <li>Student points direction of the "E"</li>
              <li>Tap the direction they indicate</li>
              <li>Test adapts based on responses</li>
            </ol>
            <button
              className="button button-primary button-large"
              onClick={startTest}
            >
              Start Vision Test
            </button>
          </div>
        )}

        {isTestRunning && currentTrial && (
          <div className="vision-test-container">
            <div className="test-progress">
              <div className="progress-text">
                Trial {engine.thresholdTrials + 1} | Reversals: {engine.reversals}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(engine.thresholdTrials / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="symbol-container">
              {renderE(currentTrial.direction, getSymbolSize(currentTrial.logmar))}
              {feedback && (
                <div className={`feedback ${feedback.includes('✅') ? 'correct' : 'incorrect'}`}>
                  {feedback}
                </div>
              )}
            </div>

            <div className="logmar-info">
              logMAR {currentTrial.logmar.toFixed(1)} ≈ {logmarToSnellen(currentTrial.logmar)}
            </div>

            <div className="direction-buttons">
              <button 
                className="direction-btn up"
                onClick={() => handleResponse('up')}
                disabled={feedback !== ''}
              >
                ↑
              </button>
              <div className="direction-row">
                <button 
                  className="direction-btn left"
                  onClick={() => handleResponse('left')}
                  disabled={feedback !== ''}
                >
                  ←
                </button>
                <button 
                  className="direction-btn right"
                  onClick={() => handleResponse('right')}
                  disabled={feedback !== ''}
                >
                  →
                </button>
              </div>
              <button 
                className="direction-btn down"
                onClick={() => handleResponse('down')}
                disabled={feedback !== ''}
              >
                ↓
              </button>
            </div>
          </div>
        )}

        {testComplete && result && (
          <div className="card">
            <div className="card-header">✅ Vision Test Complete</div>
            
            <div className="result-summary">
              <div className={`result-badge ${result.pass ? 'pass' : 'refer'}`}>
                {result.pass ? '✅ PASS' : '⚠️ REFER'}
              </div>
              
              <div className="result-details">
                <p><strong>Visual Acuity:</strong></p>
                <p className="result-value">
                  logMAR {result.logMAR.toFixed(1)}
                </p>
                <p className="result-value">
                  {result.snellenEquivalent} Snellen
                </p>
                
                <p style={{ marginTop: '1rem' }}><strong>Criteria:</strong> Pass ≤ 0.3 (20/40)</p>
                <p><strong>Trials:</strong> {result.trialsCompleted}</p>
                <p><strong>Reversals:</strong> {result.reversals}</p>
              </div>
            </div>

            <div className="actions">
              <button
                className="button button-primary button-large"
                onClick={handleContinue}
              >
                Continue to Hearing Test →
              </button>
              <button
                className="button button-secondary"
                onClick={startTest}
              >
                ↻ Repeat Vision Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisionScreen;
