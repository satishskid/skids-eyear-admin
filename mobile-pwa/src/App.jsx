import React, { useState, useEffect } from 'react';
import { db } from './services/indexedDB';
import HomeScreen from './screens/HomeScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import VisionScreen from './screens/VisionScreen';
import HearingScreen from './screens/HearingScreen';
import ResultsScreen from './screens/ResultsScreen';
import ExportScreen from './screens/ExportScreen';
import CalibrationScreen from './screens/CalibrationScreen';
import AnalyticsDashboard from './screens/AnalyticsDashboard';
import EMRConfigScreen from './screens/EMRConfigScreen';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenData, setScreenData] = useState({});
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await db.init();
      setIsDbReady(true);
      console.log('✅ Database initialized');
    } catch (err) {
      console.error('❌ Database initialization failed:', err);
      setError('Failed to initialize database: ' + err.message);
    }
  };

  const navigate = (screen, data = {}) => {
    setScreenData(data);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (!isDbReady) {
      return (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Initializing SKIDS EYEAR...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-screen">
          <h1>⚠️ Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'qr-scanner':
        return <QRScannerScreen navigate={navigate} data={screenData} />;
      case 'vision':
        return <VisionScreen navigate={navigate} data={screenData} />;
      case 'hearing':
        return <HearingScreen navigate={navigate} data={screenData} />;
      case 'results':
        return <ResultsScreen navigate={navigate} data={screenData} />;
      case 'export':
        return <ExportScreen navigate={navigate} data={screenData} />;
      case 'calibration':
        return <CalibrationScreen navigate={navigate} />;
      case 'analytics':
        return <AnalyticsDashboard navigate={navigate} />;
      case 'emr-config':
        return <EMRConfigScreen navigate={navigate} />;
      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
}

export default App;
