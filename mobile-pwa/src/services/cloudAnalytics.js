/**
 * Cloud-Based Analytics Service
 * Aggregates screening data for population health insights
 * Privacy-focused with de-identification
 */

/**
 * Analytics Data Aggregator
 */
export class AnalyticsAggregator {
  constructor() {
    this.apiEndpoint = null;
    this.apiKey = null;
    this.orgId = null;
  }

  /**
   * Configure cloud analytics endpoint
   */
  configure(config) {
    this.apiEndpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.orgId = config.organizationId;
    this.saveConfig(config);
  }

  /**
   * De-identify screening result for analytics
   * Removes PII while preserving analytical value
   */
  deIdentify(screeningResult) {
    return {
      // Anonymized identifiers
      anonymousId: this.hashId(screeningResult.child_id),
      schoolCode: screeningResult.school_code,
      
      // Temporal data (month/year only)
      screeningMonth: new Date(screeningResult.screening_date).getMonth() + 1,
      screeningYear: new Date(screeningResult.screening_date).getFullYear(),
      ageGroup: this.calculateAgeGroup(screeningResult.date_of_birth),
      
      // Vision results
      visionPass: screeningResult.vision_result?.pass || null,
      visionLeftEye: screeningResult.vision_result?.left_eye || null,
      visionRightEye: screeningResult.vision_result?.right_eye || null,
      
      // Hearing results
      hearingPass: screeningResult.hearing_result?.pass || null,
      hearing1000Hz: screeningResult.hearing_result?.frequency_1000_hz || null,
      hearing2000Hz: screeningResult.hearing_result?.frequency_2000_hz || null,
      hearing4000Hz: screeningResult.hearing_result?.frequency_4000_hz || null,
      hearing500Hz: screeningResult.hearing_result?.frequency_500_hz || null,
      hearing8000Hz: screeningResult.hearing_result?.frequency_8000_hz || null,
      
      // Outcomes
      referralNeeded: screeningResult.referral_needed,
      
      // Metadata (no PII)
      deviceType: this.getDeviceType(),
      browserType: this.getBrowserType(),
      
      // Organization
      organizationId: this.orgId
    };
  }

  /**
   * Hash patient ID for anonymization
   */
  hashId(id) {
    // Simple hash function (use crypto.subtle.digest in production)
    let hash = 0;
    const str = id + this.orgId + 'salt'; // Add org-specific salt
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate age group from date of birth
   */
  calculateAgeGroup(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 3) return '0-2';
    if (age < 5) return '3-4';
    if (age < 8) return '5-7';
    if (age < 11) return '8-10';
    if (age < 14) return '11-13';
    if (age < 18) return '14-17';
    return '18+';
  }

  getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile';
    if (/tablet|ipad/.test(ua)) return 'tablet';
    return 'desktop';
  }

  getBrowserType() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('safari')) return 'safari';
    if (ua.includes('edge')) return 'edge';
    return 'other';
  }

  /**
   * Submit analytics data to cloud
   */
  async submitAnalytics(screeningResults) {
    if (!this.apiEndpoint) {
      throw new Error('Analytics not configured');
    }

    // De-identify all results
    const deidentifiedData = screeningResults.map(result => this.deIdentify(result));

    try {
      const response = await fetch(`${this.apiEndpoint}/analytics/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Organization-ID': this.orgId
        },
        body: JSON.stringify({
          data: deidentifiedData,
          timestamp: new Date().toISOString(),
          version: '1.0'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        submitted: deidentifiedData.length,
        response: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch analytics insights from cloud
   */
  async fetchInsights(filters = {}) {
    if (!this.apiEndpoint) {
      throw new Error('Analytics not configured');
    }

    const params = new URLSearchParams({
      organizationId: this.orgId,
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      schoolCode: filters.schoolCode || '',
      ageGroup: filters.ageGroup || ''
    });

    try {
      const response = await fetch(`${this.apiEndpoint}/analytics/insights?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Organization-ID': this.orgId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        insights: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  saveConfig(config) {
    localStorage.setItem('cloud_analytics_config', JSON.stringify({
      endpoint: config.endpoint,
      organizationId: config.organizationId,
      timestamp: Date.now()
    }));
  }

  loadConfig() {
    const stored = localStorage.getItem('cloud_analytics_config');
    if (stored) {
      const config = JSON.parse(stored);
      this.apiEndpoint = config.endpoint;
      this.orgId = config.organizationId;
      return config;
    }
    return null;
  }
}

/**
 * Local Analytics Calculator
 * Performs analytics on local data without cloud submission
 */
export class LocalAnalytics {
  constructor(results) {
    this.results = results;
  }

  /**
   * Calculate overall statistics
   */
  calculateOverallStats() {
    const total = this.results.length;
    const visionPass = this.results.filter(r => r.vision_result?.pass).length;
    const hearingPass = this.results.filter(r => r.hearing_result?.pass).length;
    const referrals = this.results.filter(r => r.referral_needed).length;

    return {
      total,
      visionPassRate: ((visionPass / total) * 100).toFixed(1),
      hearingPassRate: ((hearingPass / total) * 100).toFixed(1),
      referralRate: ((referrals / total) * 100).toFixed(1)
    };
  }

  /**
   * Calculate frequency-specific hearing statistics
   */
  calculateHearingFrequencyStats() {
    const frequencies = {
      '500Hz': { pass: 0, total: 0 },
      '1000Hz': { pass: 0, total: 0 },
      '2000Hz': { pass: 0, total: 0 },
      '4000Hz': { pass: 0, total: 0 },
      '8000Hz': { pass: 0, total: 0 }
    };

    this.results.forEach(result => {
      if (result.hearing_result) {
        if (result.hearing_result.frequency_500_hz !== undefined) {
          frequencies['500Hz'].total++;
          if (result.hearing_result.frequency_500_hz) frequencies['500Hz'].pass++;
        }
        if (result.hearing_result.frequency_1000_hz !== undefined) {
          frequencies['1000Hz'].total++;
          if (result.hearing_result.frequency_1000_hz) frequencies['1000Hz'].pass++;
        }
        if (result.hearing_result.frequency_2000_hz !== undefined) {
          frequencies['2000Hz'].total++;
          if (result.hearing_result.frequency_2000_hz) frequencies['2000Hz'].pass++;
        }
        if (result.hearing_result.frequency_4000_hz !== undefined) {
          frequencies['4000Hz'].total++;
          if (result.hearing_result.frequency_4000_hz) frequencies['4000Hz'].pass++;
        }
        if (result.hearing_result.frequency_8000_hz !== undefined) {
          frequencies['8000Hz'].total++;
          if (result.hearing_result.frequency_8000_hz) frequencies['8000Hz'].pass++;
        }
      }
    });

    // Calculate pass rates
    Object.keys(frequencies).forEach(freq => {
      const data = frequencies[freq];
      data.passRate = data.total > 0 
        ? ((data.pass / data.total) * 100).toFixed(1) 
        : 'N/A';
    });

    return frequencies;
  }

  /**
   * Calculate age group distribution
   */
  calculateAgeDistribution() {
    const ageGroups = {
      '0-2': 0, '3-4': 0, '5-7': 0, '8-10': 0, 
      '11-13': 0, '14-17': 0, '18+': 0
    };

    this.results.forEach(result => {
      const age = this.calculateAge(result.date_of_birth);
      const group = this.getAgeGroup(age);
      ageGroups[group]++;
    });

    return ageGroups;
  }

  calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  }

  getAgeGroup(age) {
    if (age < 3) return '0-2';
    if (age < 5) return '3-4';
    if (age < 8) return '5-7';
    if (age < 11) return '8-10';
    if (age < 14) return '11-13';
    if (age < 18) return '14-17';
    return '18+';
  }

  /**
   * Calculate temporal trends
   */
  calculateTemporalTrends() {
    const months = {};

    this.results.forEach(result => {
      const date = new Date(result.screening_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, referrals: 0 };
      }
      
      months[monthKey].total++;
      if (result.referral_needed) {
        months[monthKey].referrals++;
      }
    });

    // Calculate referral rate per month
    Object.keys(months).forEach(month => {
      const data = months[month];
      data.referralRate = ((data.referrals / data.total) * 100).toFixed(1);
    });

    return months;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    return {
      overall: this.calculateOverallStats(),
      hearingFrequencies: this.calculateHearingFrequencyStats(),
      ageDistribution: this.calculateAgeDistribution(),
      temporalTrends: this.calculateTemporalTrends(),
      generatedAt: new Date().toISOString()
    };
  }
}

/**
 * Export formats for analytics data
 */
export class AnalyticsExporter {
  /**
   * Export as CSV
   */
  static exportCSV(results) {
    const headers = [
      'Screening ID', 'Screening Date', 'Age Group', 
      'Vision Pass', 'Vision Left Eye', 'Vision Right Eye',
      'Hearing Pass', '500Hz', '1000Hz', '2000Hz', '4000Hz', '8000Hz',
      'Referral Needed', 'School Code'
    ];

    const rows = results.map(r => [
      r.anonymousId || r.id,
      r.screeningMonth && r.screeningYear 
        ? `${r.screeningYear}-${String(r.screeningMonth).padStart(2, '0')}` 
        : r.screening_date,
      r.ageGroup || '',
      r.visionPass !== null ? (r.visionPass ? 'Pass' : 'Refer') : '',
      r.visionLeftEye || '',
      r.visionRightEye || '',
      r.hearingPass !== null ? (r.hearingPass ? 'Pass' : 'Refer') : '',
      r.hearing500Hz !== undefined ? (r.hearing500Hz ? 'Pass' : 'Fail') : '',
      r.hearing1000Hz !== undefined ? (r.hearing1000Hz ? 'Pass' : 'Fail') : '',
      r.hearing2000Hz !== undefined ? (r.hearing2000Hz ? 'Pass' : 'Fail') : '',
      r.hearing4000Hz !== undefined ? (r.hearing4000Hz ? 'Pass' : 'Fail') : '',
      r.hearing8000Hz !== undefined ? (r.hearing8000Hz ? 'Pass' : 'Fail') : '',
      r.referralNeeded ? 'Yes' : 'No',
      r.schoolCode || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csv;
  }

  /**
   * Export as JSON
   */
  static exportJSON(results) {
    return JSON.stringify(results, null, 2);
  }

  /**
   * Download file
   */
  static download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default {
  AnalyticsAggregator,
  LocalAnalytics,
  AnalyticsExporter
};
