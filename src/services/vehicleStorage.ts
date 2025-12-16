import AsyncStorage from '@react-native-async-storage/async-storage';
import {Vehicle} from '../types/vehicle';

const VEHICLES_STORAGE_KEY = '@obd_vehicles';
const DIAGNOSTICS_STORAGE_KEY = '@obd_diagnostics';

export const vehicleStorage = {
  // Get all vehicles
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const data = await AsyncStorage.getItem(VEHICLES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  },

  // Get single vehicle by ID
  async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      const vehicles = await this.getAllVehicles();
      return vehicles.find(v => v.id === id) || null;
    } catch (error) {
      console.error('Error loading vehicle:', error);
      return null;
    }
  },

  // Save new vehicle
  async saveVehicle(vehicle: Vehicle): Promise<boolean> {
    try {
      const vehicles = await this.getAllVehicles();
      vehicles.push(vehicle);
      await AsyncStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
      return true;
    } catch (error) {
      console.error('Error saving vehicle:', error);
      return false;
    }
  },

  // Update existing vehicle
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<boolean> {
    try {
      const vehicles = await this.getAllVehicles();
      const index = vehicles.findIndex(v => v.id === id);

      if (index === -1) {
        return false;
      }

      vehicles[index] = {
        ...vehicles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
      return true;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return false;
    }
  },

  // Delete vehicle
  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const vehicles = await this.getAllVehicles();
      const filtered = vehicles.filter(v => v.id !== id);
      await AsyncStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  },

  // Clear all vehicles (for testing)
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(VEHICLES_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing vehicles:', error);
      return false;
    }
  },
};
