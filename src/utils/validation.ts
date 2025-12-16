import {VehicleFormData} from '../types/vehicle';

export interface ValidationErrors {
  _form?: string;
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

  // All fields are now optional, but we validate format if provided

  // Year validation (only if provided)
  if (data.year && data.year.trim().length > 0) {
    const yearNum = parseInt(data.year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
  }

  // VIN validation (only if provided)
  if (data.vin && data.vin.trim().length > 0) {
    if (data.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters';
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(data.vin)) {
      errors.vin = 'VIN contains invalid characters';
    }
  }

  // Mileage validation (only if provided)
  if (data.mileage && data.mileage.trim().length > 0) {
    const mileageNum = parseInt(data.mileage, 10);
    if (isNaN(mileageNum) || mileageNum < 0) {
      errors.mileage = 'Mileage must be a positive number';
    }
  }

  // Require at least ONE of year, make, or model
  const hasAtLeastOne =
    (data.year && data.year.trim().length > 0) ||
    (data.make && data.make.trim().length > 0) ||
    (data.model && data.model.trim().length > 0);

  if (!hasAtLeastOne) {
    errors._form = 'Please provide at least one of: Year, Make, or Model';
  }

  return errors;
};

export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
