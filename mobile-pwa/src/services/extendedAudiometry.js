/**
 * Extended Frequency Range Audiometry
 * Adds 500 Hz and 8000 Hz to standard screening protocol
 * Provides comprehensive frequency coverage
 */

export const EXTENDED_HEARING_TESTS = [
  {
    id: 'drum',
    name: 'Drum Beat',
    emoji: '🥁',
    frequency: 500, // Low frequency - bass/vowels
    color: '#8b5cf6',
    description: 'Boom boom!',
    clinical: 'Low-frequency hearing, vowel sounds',
    purpose: 'Detects conductive hearing loss, low-frequency sensorineural loss'
  },
  {
    id: 'dog',
    name: 'Dog Barking',
    emoji: '🐕',
    frequency: 1000, // Mid frequency - fundamental speech
    color: '#f59e0b',
    description: 'Woof woof!',
    clinical: 'Speech fundamental, baseline hearing',
    purpose: 'Standard reference frequency, overall hearing function'
  },
  {
    id: 'bird',
    name: 'Bird Chirping',
    emoji: '🐦',
    frequency: 2000, // Mid-high frequency - consonants
    color: '#10b981',
    description: 'Tweet tweet!',
    clinical: 'Consonant clarity, speech discrimination',
    purpose: 'Critical for understanding speech in noise'
  },
  {
    id: 'bell',
    name: 'Bell Ringing',
    emoji: '🔔',
    frequency: 4000, // High frequency - sibilants
    color: '#6366f1',
    description: 'Ding ding!',
    clinical: 'Sibilant detection, noise damage indicator',
    purpose: 'Early detection of noise-induced hearing loss'
  },
  {
    id: 'whistle',
    name: 'Whistle Blowing',
    emoji: '😗',
    frequency: 8000, // Very high frequency - extended range
    color: '#ec4899',
    description: 'Wheee!',
    clinical: 'Extended high-frequency hearing',
    purpose: 'Ototoxicity monitoring, ultra-high frequency loss'
  }
];

/**
 * Clinical interpretation guidelines for extended audiometry
 */
export const FREQUENCY_INTERPRETATIONS = {
  500: {
    normalRange: [0, 25], // dB HL
    significance: 'Vowel sounds, low-frequency environmental sounds',
    lossIndicates: [
      'Conductive hearing loss (middle ear problems)',
      'Low-frequency sensorineural hearing loss (rare)',
      'Meniere\'s disease (low-frequency fluctuating loss)'
    ]
  },
  1000: {
    normalRange: [0, 25],
    significance: 'Speech fundamental frequency, baseline hearing',
    lossIndicates: [
      'General hearing impairment',
      'Mixed hearing loss',
      'Age-related hearing loss (presbycusis) - early stage'
    ]
  },
  2000: {
    normalRange: [0, 25],
    significance: 'Consonant clarity, speech understanding',
    lossIndicates: [
      'Speech discrimination difficulty',
      'Noise-induced hearing loss - early',
      'Age-related hearing loss'
    ]
  },
  4000: {
    normalRange: [0, 25],
    significance: 'Sibilants (/s/, /f/, /th/), high-frequency sounds',
    lossIndicates: [
      'Noise-induced hearing loss - "4 kHz notch"',
      'Ototoxic drug exposure',
      'Early presbycusis'
    ]
  },
  8000: {
    normalRange: [0, 25],
    significance: 'Extended high-frequency hearing',
    lossIndicates: [
      'Early ototoxicity (before affecting lower frequencies)',
      'Noise exposure (ultra-high frequency damage)',
      'Age-related high-frequency loss'
    ]
  }
};

/**
 * Audiogram pattern recognition
 */
export class AudiogramAnalyzer {
  constructor(results) {
    this.results = results; // { 500: true/false, 1000: true/false, ... }
  }

  /**
   * Detect common audiometric patterns
   */
  detectPattern() {
    const frequencies = [500, 1000, 2000, 4000, 8000];
    const failures = frequencies.filter(f => !this.results[f]);

    // All pass
    if (failures.length === 0) {
      return {
        pattern: 'normal',
        name: 'Normal Hearing',
        description: 'All frequencies passed screening threshold',
        referral: false,
        urgency: 'none'
      };
    }

    // High-frequency loss (4kHz and/or 8kHz only)
    if (failures.every(f => f >= 4000)) {
      return {
        pattern: 'high-frequency-loss',
        name: 'High-Frequency Hearing Loss',
        description: 'Loss limited to high frequencies (4-8 kHz)',
        possibleCauses: [
          'Noise exposure',
          'Ototoxic medications',
          'Early presbycusis',
          'Genetic factors'
        ],
        referral: true,
        urgency: 'routine'
      };
    }

    // Low-frequency loss (500Hz only)
    if (failures.length === 1 && failures[0] === 500) {
      return {
        pattern: 'low-frequency-loss',
        name: 'Low-Frequency Hearing Loss',
        description: 'Loss limited to low frequencies',
        possibleCauses: [
          'Conductive loss (middle ear fluid)',
          'Meniere\'s disease',
          'Otosclerosis (early)'
        ],
        referral: true,
        urgency: 'prompt'
      };
    }

    // "Cookie bite" (1kHz and 2kHz loss, preserved low and high)
    if (!this.results[1000] && !this.results[2000] && 
        this.results[500] && this.results[4000]) {
      return {
        pattern: 'cookie-bite',
        name: 'Mid-Frequency Hearing Loss',
        description: 'Loss in middle frequencies with preserved low and high',
        possibleCauses: [
          'Genetic hearing loss',
          'Specific hereditary conditions'
        ],
        referral: true,
        urgency: 'prompt'
      };
    }

    // Flat loss (all or most frequencies affected)
    if (failures.length >= 4) {
      return {
        pattern: 'flat-loss',
        name: 'Broad-Spectrum Hearing Loss',
        description: 'Loss across multiple frequency ranges',
        possibleCauses: [
          'Significant sensorineural hearing loss',
          'Mixed hearing loss',
          'Severe conductive loss'
        ],
        referral: true,
        urgency: 'urgent'
      };
    }

    // Sloping loss (progressive failure from low to high)
    const isSloping = failures.every((f, i, arr) => 
      i === 0 || f > arr[i - 1]
    );
    if (isSloping) {
      return {
        pattern: 'sloping-loss',
        name: 'Progressive High-Frequency Loss',
        description: 'Worsening loss as frequency increases',
        possibleCauses: [
          'Age-related hearing loss (presbycusis)',
          'Noise-induced hearing loss',
          'Progressive sensorineural loss'
        ],
        referral: true,
        urgency: 'routine'
      };
    }

    // Unknown/irregular pattern
    return {
      pattern: 'irregular',
      name: 'Irregular Hearing Loss Pattern',
      description: 'Non-standard pattern requiring evaluation',
      possibleCauses: [
        'Test reliability issues',
        'Unusual hearing loss configuration',
        'Need for retest'
      ],
      referral: true,
      urgency: 'prompt'
    };
  }

  /**
   * Calculate Speech Intelligibility Index (SII)
   * Estimates impact on speech understanding
   */
  calculateSII() {
    const frequencies = [500, 1000, 2000, 4000];
    const weights = {
      500: 0.15,   // 15% contribution to speech
      1000: 0.25,  // 25% contribution
      2000: 0.35,  // 35% contribution
      4000: 0.25   // 25% contribution
    };

    let siiScore = 0;
    frequencies.forEach(freq => {
      if (this.results[freq]) {
        siiScore += weights[freq];
      }
    });

    return {
      score: siiScore,
      percentage: Math.round(siiScore * 100),
      interpretation: this.interpretSII(siiScore)
    };
  }

  interpretSII(score) {
    if (score >= 0.75) return 'Excellent speech understanding expected';
    if (score >= 0.50) return 'Good speech understanding in quiet';
    if (score >= 0.30) return 'Moderate difficulty, especially in noise';
    return 'Significant speech understanding difficulty';
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const pattern = this.detectPattern();
    const sii = this.calculateSII();

    return {
      ...pattern,
      speechIntelligibility: sii,
      frequencies: {
        500: this.results[500] || false,
        1000: this.results[1000] || false,
        2000: this.results[2000] || false,
        4000: this.results[4000] || false,
        8000: this.results[8000] || false
      },
      recommendations: this.generateRecommendations(pattern)
    };
  }

  generateRecommendations(pattern) {
    const recommendations = [];

    if (pattern.referral) {
      recommendations.push('Refer to audiologist for comprehensive evaluation');
      
      if (pattern.urgency === 'urgent') {
        recommendations.push('Priority referral recommended');
      }
    }

    if (pattern.pattern === 'high-frequency-loss') {
      recommendations.push('Hearing protection education');
      recommendations.push('Noise exposure history assessment');
    }

    if (pattern.pattern === 'low-frequency-loss') {
      recommendations.push('Medical evaluation for middle ear pathology');
      recommendations.push('Consider tympanometry');
    }

    if (pattern.pattern === 'flat-loss') {
      recommendations.push('Immediate audiological assessment');
      recommendations.push('Consider hearing aid evaluation');
    }

    return recommendations;
  }
}

/**
 * Extended test configuration
 */
export const EXTENDED_TEST_CONFIG = {
  frequencies: [500, 1000, 2000, 4000, 8000],
  intensity: 30, // dB HL
  duration: 1500, // ms
  interStimulusInterval: 2000, // ms
  randomize: true,
  repeatFailures: true
};

export default {
  EXTENDED_HEARING_TESTS,
  FREQUENCY_INTERPRETATIONS,
  AudiogramAnalyzer,
  EXTENDED_TEST_CONFIG
};
