export interface Vehicle {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  nickname?: string;
  color?: string;
  mileage?: number;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  vin: string;
  nickname?: string;
  color?: string;
  mileage?: string;
  photo?: string;
}

export interface DiagnosticSession {
  id: string;
  vehicleId: string;
  timestamp: string;
  errorCodes: ErrorCode[];
  clearedCodes: string[];
}

export interface ErrorCode {
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'pending' | 'cleared';
}
