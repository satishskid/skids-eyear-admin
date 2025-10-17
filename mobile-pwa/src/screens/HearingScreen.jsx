import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/indexedDB';
import './HearingScreen.css';

// Sound-to-frequency mapping for pediatric audiometry
const HEARING_TESTS = [
  {
    id: 'dog',
    name: 'Dog Barking',
    emoji: '🐕',
    frequency: 1000, // 1000 Hz approximates dog bark
    color: '#f59e0b',
    description: 'Woof woof!'
  },
  {
    id: 'bird',
    name: 'Bird Chirping',
    emoji: '🐦',
    frequency: 2000, // 2000 Hz approximates bird chirp
    color: '#10b981',
    description: 'Tweet tweet!'
  },
  {
    id: 'bell',
    name: 'Bell Ringing',
    emoji: '🔔',
    frequency: 4000, // 4000 Hz approximates bell ring
    color: '#6366f1',
    description: 'Ding ding!'
  }
];

function HearingScreen({ navigate, data }) {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [responses, setResponses] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = async (frequency, durationMs = 1000) => {
    const audioContext = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Set volume (30 dB HL approximation - adjust for headphones)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    oscillator.start();
    
    setIsPlaying(true);
    oscillatorRef.current = oscillator;
    
    // Play for duration
    await new Promise(resolve => setTimeout(resolve, durationMs));
    
    oscillator.stop();
    setIsPlaying(false);
  };

  const startTest = async () => {
    setTestStarted(true);
    await runCurrentTest();
  };

  const runCurrentTest = async () => {
    const test = HEARING_TESTS[currentTestIndex];
    
    // Show all options
    setWaitingForResponse(false);
    setShowFeedback(null);
    
    // Wait 2 seconds before playing sound
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Play the tone
    await playTone(test.frequency, 1500);
    
    // Now wait for child to respond
    setWaitingForResponse(true);
  };

  const handleResponse = async (selectedId) => {
    if (!waitingForResponse) return;
    
    const currentTest = HEARING_TESTS[currentTestIndex];
    const isCorrect = selectedId === currentTest.id;
    
    // Record response
    setResponses({
      ...responses,
      [currentTest.id]: isCorrect
    });
    
    // Show feedback
    setShowFeedback(isCorrect ? 'correct' : 'incorrect');
    setWaitingForResponse(false);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Move to next test or finish
    if (currentTestIndex < HEARING_TESTS.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
      setShowFeedback(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      await runCurrentTest();
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    // Calculate pass/fail
    const correctCount = Object.values(responses).filter(r => r === true).length;
    const pass = correctCount === HEARING_TESTS.length; // Must get all correct
    
    const hearingResult = {
      responses,
      correctCount,
      totalTests: HEARING_TESTS.length,
      pass,
      frequency_1000_hz: responses['dog'] || false,
      frequency_2000_hz: responses['bird'] || false,
      frequency_4000_hz: responses['bell'] || false,
    };
    
    // Save to database
    const result = {
      id: `result_${Date.now()}`,
      child_id: data.child.id,
      child_name: data.child.name,
      date_of_birth: data.child.date_of_birth,
      screening_date: new Date().toISOString(),
      vision_result: data.visionResult,
      hearing_result: hearingResult,
      screener_name: data.screenerName,
      school_code: data.schoolCode,
      referral_needed: !data.visionResult.pass || !hearingResult.pass,
      synced: false
    };
    
    await db.addResult(result);
    
    setTestComplete(true);
  };

  const handleContinue = () => {
    navigate('results', {
      ...data,
      hearingResult: responses
    });
  };

  const handleRetest = () => {
    setCurrentTestIndex(0);
    setResponses({});
    setTestComplete(false);
    setTestStarted(false);
    setShowFeedback(null);
    setWaitingForResponse(false);
  };

  const currentTest = HEARING_TESTS[currentTestIndex];
  const progress = ((currentTestIndex + 1) / HEARING_TESTS.length) * 100;

  return (
    <div className="screen hearing-screen">
      <div className="screen-header">
        <button className="back-button" onClick={() => navigate('vision', data)}>
          ←
        </button>
        <h1 className="screen-title">Hearing Test</h1>
      </div>

      <div className="screen-content">
        {!testStarted && !testComplete && (
          <div className="card">
            <div className="card-header">👂 Hearing Screening</div>
            <p><strong>Student:</strong> {data.child.name}</p>
            <p><strong>Test:</strong> Picture-based sound identification</p>
            
            <div className="instructions">
              <p><strong>Instructions for screener:</strong></p>
              <ol>
                <li>Put headphones on the child</li>
                <li>Adjust volume to comfortable level</li>
                <li>Say: "You'll hear sounds - point to the picture that matches!"</li>
                <li>Each sound will play once</li>
                <li>Child points to what they heard</li>
              </ol>
              
              <div className="sound-preview">
                <p><strong>Sounds being tested:</strong></p>
                <div className="sound-cards-preview">
                  {HEARING_TESTS.map(test => (
                    <div key={test.id} className="sound-card-mini" style={{ borderColor: test.color }}>
                      <div className="sound-emoji-mini">{test.emoji}</div>
                      <div className="sound-name-mini">{test.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="button button-primary button-large"
              onClick={startTest}
            >
              Start Hearing Test
            </button>
          </div>
        )}

        {testStarted && !testComplete && (
          <div className="hearing-test-container">
            {/* Progress */}
            <div className="test-progress">
              <div className="progress-text">
                Sound {currentTestIndex + 1} of {HEARING_TESTS.length}
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Status Message */}
            <div className="status-message">
              {!waitingForResponse && !isPlaying && (
                <p className="status-text">🎧 Get ready... Listen carefully!</p>
              )}
              {isPlaying && (
                <p className="status-text playing">🔊 Playing sound now...</p>
              )}
              {waitingForResponse && (
                <p className="status-text waiting">👉 Point to what you heard!</p>
              )}
            </div>

            {/* Sound Options */}
            <div className="sound-cards-grid">
              {HEARING_TESTS.map(test => (
                <button
                  key={test.id}
                  className={`sound-card ${showFeedback && test.id === currentTest.id ? showFeedback : ''}`}
                  style={{ borderColor: test.color }}
                  onClick={() => handleResponse(test.id)}
                  disabled={!waitingForResponse || showFeedback !== null}
                >
                  <div className="sound-emoji">{test.emoji}</div>
                  <div className="sound-name">{test.name}</div>
                  <div className="sound-desc">{test.description}</div>
                  
                  {showFeedback && test.id === currentTest.id && (
                    <div className="feedback-overlay">
                      {showFeedback === 'correct' ? '✅' : '❌'}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Testing Info */}
            <div className="test-info">
              <p>Testing: {currentTest.frequency} Hz frequency</p>
            </div>
          </div>
        )}

        {testComplete && (
          <div className="card">
            <div className="card-header">✅ Hearing Test Complete</div>
            
            <div className="result-summary">
              <div className={`result-badge ${Object.values(responses).filter(r => r).length === HEARING_TESTS.length ? 'pass' : 'refer'}`}>
                {Object.values(responses).filter(r => r).length === HEARING_TESTS.length ? '✅ PASS' : '⚠️ REFER'}
              </div>
              
              <div className="result-details">
                <p><strong>Results:</strong></p>
                {HEARING_TESTS.map(test => (
                  <div key={test.id} className="frequency-result">
                    <span className="frequency-emoji">{test.emoji}</span>
                    <span className="frequency-name">{test.name}</span>
                    <span className="frequency-freq">({test.frequency} Hz)</span>
                    <span className={`frequency-status ${responses[test.id] ? 'pass' : 'fail'}`}>
                      {responses[test.id] ? '✅ Detected' : '❌ Not detected'}
                    </span>
                  </div>
                ))}
                
                <p style={{ marginTop: '1rem' }}>
                  <strong>Score:</strong> {Object.values(responses).filter(r => r).length} / {HEARING_TESTS.length} correct
                </p>
                <p><strong>Criteria:</strong> Must identify all sounds correctly</p>
              </div>
            </div>

            <div className="actions">
              <button
                className="button button-primary button-large"
                onClick={handleContinue}
              >
                View Complete Results →
              </button>
              <button
                className="button button-secondary"
                onClick={handleRetest}
              >
                ↻ Repeat Hearing Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HearingScreen;
