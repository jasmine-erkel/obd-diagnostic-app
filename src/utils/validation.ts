import {VehicleFormData} from '../types/vehicle';

export interface ValidationErrors {
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  nickname?: string;
  color?: string;
  mileage?: string;
}

export const validateVehicleForm = (data: VehicleFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Make validation
  if (!data.make || data.make.trim().length === 0) {
    errors.make = 'Make is required';
  }

  // Model validation
  if (!data.model || data.model.trim().length === 0) {
    errors.model = 'Model is required';
  }

  // Year validation
  if (!data.year || data.year.trim().length === 0) {
    errors.year = 'Year is required';
  } else {
    const yearNum = parseInt(data.year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
  }

  // VIN validation
  if (!data.vin || data.vin.trim().length === 0) {
    errors.vin = 'VIN is required';
  } else if (data.vin.length !== 17) {
    errors.vin = 'VIN must be exactly 17 characters';
  } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(data.vin)) {
    errors.vin = 'VIN contains invalid characters';
  }

  // Mileage validation (optional)
  if (data.mileage && data.mileage.trim().length > 0) {
    const mileageNum = parseInt(data.mileage, 10);
    if (isNaN(mileageNum) || mileageNum < 0) {
      errors.mileage = 'Mileage must be a positive number';
    }
  }

  return errors;
};

export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
