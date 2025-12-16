export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage?: number;
  type: MaintenanceType;
  title: string;
  description?: string;
  cost?: number;
  servicedBy?: string; // Shop or person who did the work
  parts?: string[]; // List of parts replaced/used
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'inspection'
  | 'repair'
  | 'fluid_change'
  | 'battery'
  | 'filter_replacement'
  | 'tune_up'
  | 'other';

export const MaintenanceTypeLabels: Record<MaintenanceType, string> = {
  oil_change: 'Oil Change',
  tire_rotation: 'Tire Rotation',
  brake_service: 'Brake Service',
  inspection: 'Inspection',
  repair: 'Repair',
  fluid_change: 'Fluid Change',
  battery: 'Battery Service',
  filter_replacement: 'Filter Replacement',
  tune_up: 'Tune-Up',
  other: 'Other',
};

export const MaintenanceTypeIcons: Record<MaintenanceType, string> = {
  oil_change: '🛢️',
  tire_rotation: '🛞',
  brake_service: '🛑',
  inspection: '🔍',
  repair: '🔧',
  fluid_change: '💧',
  battery: '🔋',
  filter_replacement: '🌬️',
  tune_up: '⚙️',
  other: '📋',
};
