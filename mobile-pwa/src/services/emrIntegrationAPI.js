/**
 * EMR Integration API
 * Standardized API for Electronic Medical Record integration
 * Supports HL7 FHIR, HL7 v2, and custom REST endpoints
 */

/**
 * FHIR R4 DiagnosticReport Builder
 */
export class FHIRDiagnosticReportBuilder {
  constructor(screeningResult) {
    this.result = screeningResult;
  }

  /**
   * Build complete FHIR DiagnosticReport resource
   */
  build() {
    return {
      resourceType: 'DiagnosticReport',
      id: this.result.id || this.generateId(),
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/DiagnosticReport'],
        lastUpdated: new Date().toISOString()
      },
      identifier: [
        {
          system: 'http://skidseyear.org/screening-id',
          value: this.result.id
        }
      ],
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'AU',
              display: 'Audiology'
            },
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'OP',
              display: 'Ophthalmology'
            }
          ],
          text: 'Pediatric Vision and Hearing Screening'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '80342-2',
            display: 'Hearing screening panel'
          }
        ],
        text: 'SKIDS EYEAR - Pediatric Vision and Hearing Screening'
      },
      subject: this.buildPatientReference(),
      effectiveDateTime: this.result.screening_date,
      issued: new Date().toISOString(),
      performer: [this.buildPerformerReference()],
      result: this.buildObservations(),
      conclusion: this.buildConclusion(),
      conclusionCode: this.buildConclusionCodes()
    };
  }

  buildPatientReference() {
    return {
      reference: `Patient/${this.result.child_id}`,
      display: this.result.child_name,
      identifier: {
        system: 'http://school.org/student-id',
        value: this.result.child_id
      }
    };
  }

  buildPerformerReference() {
    return {
      reference: `Practitioner/${this.result.screener_name}`,
      display: this.result.screener_name,
      type: 'Practitioner'
    };
  }

  buildObservations() {
    const observations = [];

    // Vision observations
    if (this.result.vision_result) {
      observations.push({
        reference: '#vision-acuity',
        display: 'Visual Acuity Test'
      });
    }

    // Hearing observations
    if (this.result.hearing_result) {
      observations.push({
        reference: '#hearing-1000hz',
        display: 'Hearing Test 1000 Hz'
      });
      observations.push({
        reference: '#hearing-2000hz',
        display: 'Hearing Test 2000 Hz'
      });
      observations.push({
        reference: '#hearing-4000hz',
        display: 'Hearing Test 4000 Hz'
      });
    }

    return observations;
  }

  buildConclusion() {
    const parts = [];

    if (this.result.vision_result) {
      const visionStatus = this.result.vision_result.pass ? 'PASS' : 'REFER';
      parts.push(`Vision Screening: ${visionStatus}`);
    }

    if (this.result.hearing_result) {
      const hearingStatus = this.result.hearing_result.pass ? 'PASS' : 'REFER';
      parts.push(`Hearing Screening: ${hearingStatus}`);
    }

    if (this.result.referral_needed) {
      parts.push('REFERRAL RECOMMENDED for further evaluation');
    }

    return parts.join('. ');
  }

  buildConclusionCodes() {
    const codes = [];

    if (this.result.referral_needed) {
      codes.push({
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '183516009',
            display: 'Referral to specialist service'
          }
        ]
      });
    }

    if (this.result.vision_result && !this.result.vision_result.pass) {
      codes.push({
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '246636008',
            display: 'Visual impairment screening abnormal'
          }
        ]
      });
    }

    if (this.result.hearing_result && !this.result.hearing_result.pass) {
      codes.push({
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '43371004',
            display: 'Hearing screening abnormal'
          }
        ]
      });
    }

    return codes;
  }

  generateId() {
    return `screening-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * HL7 v2 Message Builder
 */
export class HL7v2MessageBuilder {
  constructor(screeningResult) {
    this.result = screeningResult;
  }

  /**
   * Build HL7 v2.5 ORU^R01 message (Observation Result)
   */
  build() {
    const segments = [];
    const messageDateTime = this.formatHL7DateTime(new Date());

    // MSH - Message Header
    segments.push(this.buildMSH(messageDateTime));

    // PID - Patient Identification
    segments.push(this.buildPID());

    // OBR - Observation Request
    segments.push(this.buildOBR(messageDateTime));

    // OBX - Observation Results
    segments.push(...this.buildOBX());

    return segments.join('\r');
  }

  buildMSH(dateTime) {
    return [
      'MSH',
      '|^~\\&',
      'SKIDS_EYEAR',
      'SCREENING',
      'EMR_SYSTEM',
      'HOSPITAL',
      dateTime,
      '',
      'ORU^R01^ORU_R01',
      this.result.id,
      'P',
      '2.5',
      '',
      '',
      '',
      '',
      'AL'
    ].join('|');
  }

  buildPID() {
    const dob = this.formatHL7Date(new Date(this.result.date_of_birth));
    return [
      'PID',
      '1',
      this.result.child_id,
      this.result.child_id,
      '',
      this.result.child_name,
      '',
      dob,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      this.result.school_code
    ].join('|');
  }

  buildOBR(dateTime) {
    return [
      'OBR',
      '1',
      this.result.id,
      '',
      '80342-2^Hearing and Vision Screening^LN',
      '',
      dateTime,
      '',
      '',
      '',
      '',
      '',
      '',
      dateTime,
      '',
      '',
      '',
      this.result.screener_name,
      '',
      '',
      '',
      '',
      dateTime,
      '',
      '',
      'F'
    ].join('|');
  }

  buildOBX() {
    const observations = [];
    let setId = 1;

    // Vision results
    if (this.result.vision_result) {
      observations.push([
        'OBX',
        setId++,
        'ST',
        'VISION^Visual Acuity^LN',
        '',
        this.result.vision_result.pass ? 'PASS' : 'REFER',
        '',
        '',
        this.result.vision_result.pass ? 'N' : 'A',
        'F',
        '',
        '',
        this.formatHL7DateTime(new Date(this.result.screening_date))
      ].join('|'));
    }

    // Hearing results
    if (this.result.hearing_result) {
      observations.push([
        'OBX',
        setId++,
        'ST',
        'HEAR1000^Hearing 1000Hz^LN',
        '',
        this.result.hearing_result.frequency_1000_hz ? 'PASS' : 'FAIL',
        '',
        '',
        this.result.hearing_result.frequency_1000_hz ? 'N' : 'A',
        'F',
        '',
        '',
        this.formatHL7DateTime(new Date(this.result.screening_date))
      ].join('|'));

      observations.push([
        'OBX',
        setId++,
        'ST',
        'HEAR2000^Hearing 2000Hz^LN',
        '',
        this.result.hearing_result.frequency_2000_hz ? 'PASS' : 'FAIL',
        '',
        '',
        this.result.hearing_result.frequency_2000_hz ? 'N' : 'A',
        'F',
        '',
        '',
        this.formatHL7DateTime(new Date(this.result.screening_date))
      ].join('|'));

      observations.push([
        'OBX',
        setId++,
        'ST',
        'HEAR4000^Hearing 4000Hz^LN',
        '',
        this.result.hearing_result.frequency_4000_hz ? 'PASS' : 'FAIL',
        '',
        '',
        this.result.hearing_result.frequency_4000_hz ? 'N' : 'A',
        'F',
        '',
        '',
        this.formatHL7DateTime(new Date(this.result.screening_date))
      ].join('|'));
    }

    // Referral recommendation
    observations.push([
      'OBX',
      setId++,
      'ST',
      'REFERRAL^Referral Needed^LN',
      '',
      this.result.referral_needed ? 'YES' : 'NO',
      '',
      '',
      this.result.referral_needed ? 'A' : 'N',
      'F',
      '',
      '',
      this.formatHL7DateTime(new Date(this.result.screening_date))
    ].join('|'));

    return observations;
  }

  formatHL7DateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  formatHL7Date(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

/**
 * REST API Integration Service
 */
export class EMRRestAPIService {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.apiKey = config.apiKey || '';
    this.authType = config.authType || 'bearer'; // 'bearer', 'basic', 'apikey'
    this.headers = config.headers || {};
  }

  /**
   * Send screening result to EMR via REST API
   */
  async sendResult(screeningResult, format = 'json') {
    const payload = this.formatPayload(screeningResult, format);

    const headers = {
      'Content-Type': this.getContentType(format),
      ...this.headers
    };

    // Add authentication
    if (this.authType === 'bearer' && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.authType === 'apikey') {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(`${this.baseUrl}/screening-results`, {
        method: 'POST',
        headers,
        body: typeof payload === 'string' ? payload : JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: await response.json(),
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode || 500
      };
    }
  }

  formatPayload(result, format) {
    switch (format) {
      case 'fhir':
        return new FHIRDiagnosticReportBuilder(result).build();
      
      case 'hl7v2':
        return new HL7v2MessageBuilder(result).build();
      
      case 'json':
      default:
        return this.buildJSONPayload(result);
    }
  }

  buildJSONPayload(result) {
    return {
      screeningId: result.id,
      patient: {
        id: result.child_id,
        name: result.child_name,
        dateOfBirth: result.date_of_birth,
        schoolCode: result.school_code
      },
      screening: {
        date: result.screening_date,
        screener: result.screener_name,
        location: result.school_code
      },
      results: {
        vision: result.vision_result ? {
          status: result.vision_result.pass ? 'PASS' : 'REFER',
          leftEye: result.vision_result.left_eye,
          rightEye: result.vision_result.right_eye
        } : null,
        hearing: result.hearing_result ? {
          status: result.hearing_result.pass ? 'PASS' : 'REFER',
          frequencies: {
            '1000Hz': result.hearing_result.frequency_1000_hz,
            '2000Hz': result.hearing_result.frequency_2000_hz,
            '4000Hz': result.hearing_result.frequency_4000_hz
          }
        } : null
      },
      referralNeeded: result.referral_needed,
      synced: result.synced
    };
  }

  getContentType(format) {
    switch (format) {
      case 'fhir':
        return 'application/fhir+json';
      case 'hl7v2':
        return 'application/hl7-v2';
      case 'json':
      default:
        return 'application/json';
    }
  }

  /**
   * Query screening results from EMR
   */
  async queryResults(patientId, startDate, endDate) {
    const params = new URLSearchParams({
      patientId,
      startDate: startDate || '',
      endDate: endDate || ''
    });

    const headers = {
      'Content-Type': 'application/json',
      ...this.headers
    };

    if (this.authType === 'bearer' && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/screening-results?${params}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: await response.json()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Configure EMR endpoint
   */
  configure(config) {
    this.baseUrl = config.baseUrl || this.baseUrl;
    this.apiKey = config.apiKey || this.apiKey;
    this.authType = config.authType || this.authType;
    this.headers = { ...this.headers, ...config.headers };
  }
}

/**
 * EMR Integration Manager
 * Central service for all EMR integrations
 */
export class EMRIntegrationManager {
  constructor() {
    this.restAPI = null;
    this.config = this.loadConfig();
  }

  /**
   * Initialize with EMR-specific configuration
   */
  async initialize(emrType, config) {
    switch (emrType) {
      case 'epic':
        return this.initializeEpic(config);
      case 'cerner':
        return this.initializeCerner(config);
      case 'athenahealth':
        return this.initializeAthena(config);
      case 'custom':
        return this.initializeCustom(config);
      default:
        throw new Error(`Unsupported EMR type: ${emrType}`);
    }
  }

  async initializeEpic(config) {
    // Epic uses FHIR R4
    this.restAPI = new EMRRestAPIService({
      baseUrl: config.fhirEndpoint,
      apiKey: config.clientId,
      authType: 'bearer',
      headers: {
        'Epic-Client-ID': config.clientId
      }
    });
    this.saveConfig({ emrType: 'epic', ...config });
    return { success: true, emr: 'Epic FHIR R4' };
  }

  async initializeCerner(config) {
    // Cerner uses FHIR R4
    this.restAPI = new EMRRestAPIService({
      baseUrl: config.fhirEndpoint,
      apiKey: config.accessToken,
      authType: 'bearer'
    });
    this.saveConfig({ emrType: 'cerner', ...config });
    return { success: true, emr: 'Cerner FHIR R4' };
  }

  async initializeAthena(config) {
    // Athenahealth uses REST API
    this.restAPI = new EMRRestAPIService({
      baseUrl: config.apiEndpoint,
      apiKey: config.apiKey,
      authType: 'bearer'
    });
    this.saveConfig({ emrType: 'athenahealth', ...config });
    return { success: true, emr: 'Athenahealth REST API' };
  }

  async initializeCustom(config) {
    this.restAPI = new EMRRestAPIService(config);
    this.saveConfig({ emrType: 'custom', ...config });
    return { success: true, emr: 'Custom REST API' };
  }

  /**
   * Export screening result to configured EMR
   */
  async exportResult(screeningResult) {
    if (!this.restAPI) {
      throw new Error('EMR integration not initialized');
    }

    const format = this.config.format || 'fhir';
    return await this.restAPI.sendResult(screeningResult, format);
  }

  /**
   * Batch export multiple results
   */
  async batchExport(screeningResults) {
    const results = [];
    for (const result of screeningResults) {
      const exportResult = await this.exportResult(result);
      results.push({
        screeningId: result.id,
        ...exportResult
      });
    }
    return results;
  }

  saveConfig(config) {
    this.config = config;
    localStorage.setItem('emr_integration_config', JSON.stringify(config));
  }

  loadConfig() {
    const stored = localStorage.getItem('emr_integration_config');
    return stored ? JSON.parse(stored) : null;
  }
}

export default new EMRIntegrationManager();
