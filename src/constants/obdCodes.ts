import {ErrorCode} from '../types/vehicle';

// Common OBD-II Error Codes
export const OBD_ERROR_CODES: {[code: string]: Omit<ErrorCode, 'code' | 'status'>} = {
  P0420: {
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    severity: 'warning',
  },
  P0171: {
    description: 'System Too Lean (Bank 1)',
    severity: 'warning',
  },
  P0301: {
    description: 'Cylinder 1 Misfire Detected',
    severity: 'critical',
  },
  P0302: {
    description: 'Cylinder 2 Misfire Detected',
    severity: 'critical',
  },
  P0303: {
    description: 'Cylinder 3 Misfire Detected',
    severity: 'critical',
  },
  P0304: {
    description: 'Cylinder 4 Misfire Detected',
    severity: 'critical',
  },
  P0305: {
    description: 'Cylinder 5 Misfire Detected',
    severity: 'critical',
  },
  P0306: {
    description: 'Cylinder 6 Misfire Detected',
    severity: 'critical',
  },
  P0307: {
    description: 'Cylinder 7 Misfire Detected',
    severity: 'critical',
  },
  P0308: {
    description: 'Cylinder 8 Misfire Detected',
    severity: 'critical',
  },
  P0172: {
    description: 'System Too Rich (Bank 1)',
    severity: 'warning',
  },
  P0174: {
    description: 'System Too Lean (Bank 2)',
    severity: 'warning',
  },
  P0175: {
    description: 'System Too Rich (Bank 2)',
    severity: 'warning',
  },
  P0300: {
    description: 'Random/Multiple Cylinder Misfire Detected',
    severity: 'critical',
  },
  P0401: {
    description: 'Exhaust Gas Recirculation Flow Insufficient',
    severity: 'warning',
  },
  P0442: {
    description: 'Evaporative Emission System Leak Detected (Small Leak)',
    severity: 'info',
  },
  P0443: {
    description: 'Evaporative Emission Control System Purge Control Valve Circuit',
    severity: 'warning',
  },
  P0455: {
    description: 'Evaporative Emission System Leak Detected (Large Leak)',
    severity: 'warning',
  },
  P0500: {
    description: 'Vehicle Speed Sensor Malfunction',
    severity: 'warning',
  },
  P0505: {
    description: 'Idle Air Control System Malfunction',
    severity: 'warning',
  },
  P0506: {
    description: 'Idle Air Control System RPM Lower Than Expected',
    severity: 'warning',
  },
  P0507: {
    description: 'Idle Air Control System RPM Higher Than Expected',
    severity: 'warning',
  },
  P0600: {
    description: 'Serial Communication Link Malfunction',
    severity: 'critical',
  },
  P0700: {
    description: 'Transmission Control System Malfunction',
    severity: 'critical',
  },
  P0740: {
    description: 'Torque Converter Clutch System Malfunction',
    severity: 'warning',
  },
  P1000: {
    description: 'OBD System Readiness Test Not Complete',
    severity: 'info',
  },
  C0035: {
    description: 'Left Front Wheel Speed Circuit Malfunction',
    severity: 'warning',
  },
  C0040: {
    description: 'Right Front Wheel Speed Circuit Malfunction',
    severity: 'warning',
  },
  B0001: {
    description: 'Driver Airbag Circuit Low Resistance',
    severity: 'critical',
  },
  U0001: {
    description: 'High Speed CAN Communication Bus',
    severity: 'warning',
  },
};

// Mock live data for demonstration
export const MOCK_LIVE_DATA = {
  rpm: {
    label: 'Engine RPM',
    value: 850,
    unit: 'RPM',
    min: 0,
    max: 7000,
  },
  speed: {
    label: 'Vehicle Speed',
    value: 0,
    unit: 'MPH',
    min: 0,
    max: 160,
  },
  coolantTemp: {
    label: 'Coolant Temp',
    value: 195,
    unit: '°F',
    min: 0,
    max: 250,
  },
  fuelLevel: {
    label: 'Fuel Level',
    value: 75,
    unit: '%',
    min: 0,
    max: 100,
  },
  engineLoad: {
    label: 'Engine Load',
    value: 15,
    unit: '%',
    min: 0,
    max: 100,
  },
  throttlePosition: {
    label: 'Throttle Position',
    value: 0,
    unit: '%',
    min: 0,
    max: 100,
  },
  intakeTemp: {
    label: 'Intake Air Temp',
    value: 85,
    unit: '°F',
    min: -40,
    max: 300,
  },
  maf: {
    label: 'MAF Sensor',
    value: 3.2,
    unit: 'g/s',
    min: 0,
    max: 600,
  },
};

// Get error code details
export const getErrorCodeDetails = (code: string): ErrorCode | null => {
  const details = OBD_ERROR_CODES[code];
  if (!details) {
    return null;
  }

  return {
    code,
    ...details,
    status: 'active',
  };
};

// Get all error codes
export const getAllErrorCodes = (): string[] => {
  return Object.keys(OBD_ERROR_CODES);
};

// Search error codes
export const searchErrorCodes = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return Object.keys(OBD_ERROR_CODES).filter(
    code =>
      code.toLowerCase().includes(lowerQuery) ||
      OBD_ERROR_CODES[code].description.toLowerCase().includes(lowerQuery),
  );
};
