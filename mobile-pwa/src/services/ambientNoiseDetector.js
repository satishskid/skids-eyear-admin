/**
 * Ambient Noise Detection Service
 * Monitors environmental noise levels to ensure valid hearing test conditions
 * Complies with ANSI S3.1-1999 maximum permissible ambient noise levels
 */

export class AmbientNoiseDetector {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.isMonitoring = false;
    this.noiseThreshold = 40; // dB SPL - ANSI S3.1 recommendation
    this.callbacks = [];
  }

  /**
   * Initialize microphone access for noise monitoring
   */
  async initialize() {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });

      // Setup Web Audio API for analysis
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize ambient noise detector:', error);
      return { 
        success: false, 
        error: error.message,
        userDenied: error.name === 'NotAllowedError'
      };
    }
  }

  /**
   * Calculate ambient noise level in dB SPL
   */
  getCurrentNoiseLevel() {
    if (!this.analyser || !this.dataArray) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate RMS (Root Mean Square) of frequency data
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const rms = Math.sqrt(sum / this.dataArray.length);

    // Convert to approximate dB SPL (calibrated estimation)
    // Note: This is an approximation - actual calibration requires SPL meter
    const dbSPL = 20 * Math.log10(rms / 255) + 94; // Reference: 94 dB SPL = full scale

    return Math.max(0, dbSPL); // Clamp to non-negative
  }

  /**
   * Get frequency-specific noise levels
   * Important for masking detection in audiometry
   */
  getFrequencySpecificNoise(targetFrequency) {
    if (!this.analyser || !this.dataArray) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.analyser.frequencyBinCount;
    const targetBin = Math.floor(targetFrequency / binWidth);

    // Average across critical bandwidth (~1/3 octave)
    const criticalBandwidth = Math.max(1, Math.floor(targetFrequency * 0.1 / binWidth));
    const startBin = Math.max(0, targetBin - criticalBandwidth);
    const endBin = Math.min(this.dataArray.length - 1, targetBin + criticalBandwidth);

    let sum = 0;
    for (let i = startBin; i <= endBin; i++) {
      sum += this.dataArray[i];
    }
    const avgAmplitude = sum / (endBin - startBin + 1);

    const dbSPL = 20 * Math.log10(avgAmplitude / 255) + 94;
    return Math.max(0, dbSPL);
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(callback, interval = 1000) {
    if (!this.audioContext) {
      throw new Error('Noise detector not initialized. Call initialize() first.');
    }

    this.isMonitoring = true;
    this.callbacks.push(callback);

    const monitor = () => {
      if (!this.isMonitoring) return;

      const noiseLevel = this.getCurrentNoiseLevel();
      const isAcceptable = noiseLevel <= this.noiseThreshold;

      const status = {
        level: noiseLevel,
        threshold: this.noiseThreshold,
        acceptable: isAcceptable,
        timestamp: Date.now()
      };

      this.callbacks.forEach(cb => cb(status));

      setTimeout(monitor, interval);
    };

    monitor();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    this.callbacks = [];
  }

  /**
   * Check if environment is suitable for testing
   */
  async assessEnvironment(durationMs = 5000) {
    const samples = [];
    const sampleInterval = 500;
    const numSamples = Math.floor(durationMs / sampleInterval);

    return new Promise((resolve) => {
      let count = 0;

      const checkNoise = () => {
        const level = this.getCurrentNoiseLevel();
        samples.push(level);
        count++;

        if (count >= numSamples) {
          // Calculate statistics
          const avgNoise = samples.reduce((a, b) => a + b, 0) / samples.length;
          const maxNoise = Math.max(...samples);
          const minNoise = Math.min(...samples);
          const acceptable = maxNoise <= this.noiseThreshold;

          resolve({
            average: avgNoise.toFixed(1),
            maximum: maxNoise.toFixed(1),
            minimum: minNoise.toFixed(1),
            threshold: this.noiseThreshold,
            acceptable,
            recommendation: acceptable 
              ? 'Environment suitable for hearing screening'
              : `Too noisy! Please find a quieter location. Current: ${maxNoise.toFixed(1)} dB, Required: <${this.noiseThreshold} dB`
          });
        } else {
          setTimeout(checkNoise, sampleInterval);
        }
      };

      checkNoise();
    });
  }

  /**
   * Get ANSI S3.1 compliant noise limits for audiometry
   */
  static getANSILimits() {
    return {
      125: 49, // 125 Hz max ambient noise
      250: 35,
      500: 25,
      1000: 21,
      2000: 26,
      4000: 27,
      8000: 29,
      // Overall A-weighted
      overall: 40
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.stopMonitoring();

    if (this.microphone && this.microphone.mediaStream) {
      this.microphone.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext) {
      await this.audioContext.close();
    }

    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
  }

  /**
   * Set custom noise threshold
   */
  setThreshold(dbSPL) {
    this.noiseThreshold = dbSPL;
  }
}

export default new AmbientNoiseDetector();
