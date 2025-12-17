import React, {createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Vehicle} from '../types/vehicle';
import {vehicleStorage} from '../services/vehicleStorage';

const SELECTED_VEHICLE_KEY = '@obd_selected_vehicle';

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  selectedVehicleId: string | null;
  selectedVehicle: Vehicle | null;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Vehicle) => Promise<boolean>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (id: string) => Promise<boolean>;
  getVehicle: (id: string) => Vehicle | undefined;
  selectVehicle: (id: string | null) => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Computed: Get the selected vehicle object (memoized)
  const selectedVehicle = useMemo(
    () => (selectedVehicleId ? vehicles.find(v => v.id === selectedVehicleId) || null : null),
    [selectedVehicleId, vehicles]
  );

  const refreshVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const loadedVehicles = await vehicleStorage.getAllVehicles();
      setVehicles(loadedVehicles);
    } catch (error) {
      console.error('Error refreshing vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addVehicle = useCallback(async (vehicle: Vehicle): Promise<boolean> => {
    const success = await vehicleStorage.saveVehicle(vehicle);
    if (success) {
      const loadedVehicles = await vehicleStorage.getAllVehicles();
      setVehicles(loadedVehicles);
    }
    return success;
  }, []);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>): Promise<boolean> => {
    const success = await vehicleStorage.updateVehicle(id, updates);
    if (success) {
      const loadedVehicles = await vehicleStorage.getAllVehicles();
      setVehicles(loadedVehicles);
    }
    return success;
  }, []);

  const deleteVehicle = useCallback(async (id: string): Promise<boolean> => {
    const success = await vehicleStorage.deleteVehicle(id);
    if (success) {
      // Auto-clear selection if deleting the selected vehicle
      if (selectedVehicleId === id) {
        setSelectedVehicleId(null);
        try {
          await AsyncStorage.removeItem(SELECTED_VEHICLE_KEY);
        } catch (error) {
          console.error('Error removing selected vehicle:', error);
        }
      }
      const loadedVehicles = await vehicleStorage.getAllVehicles();
      setVehicles(loadedVehicles);
    }
    return success;
  }, [selectedVehicleId]);

  const getVehicle = useCallback((id: string): Vehicle | undefined => {
    return vehicles.find(v => v.id === id);
  }, [vehicles]);

  const selectVehicle = useCallback(async (id: string | null): Promise<void> => {
    setSelectedVehicleId(id);
    try {
      if (id === null) {
        await AsyncStorage.removeItem(SELECTED_VEHICLE_KEY);
      } else {
        await AsyncStorage.setItem(SELECTED_VEHICLE_KEY, id);
      }
    } catch (error) {
      console.error('Error saving selected vehicle:', error);
    }
  }, []);

  useEffect(() => {
    refreshVehicles();
  }, []);

  // Load selected vehicle from AsyncStorage on mount
  useEffect(() => {
    const loadSelectedVehicle = async () => {
      try {
        const savedId = await AsyncStorage.getItem(SELECTED_VEHICLE_KEY);
        if (savedId) {
          setSelectedVehicleId(savedId);
        }
      } catch (error) {
        console.error('Error loading selected vehicle:', error);
      }
    };
    loadSelectedVehicle();
  }, []);

  const value = useMemo(
    () => ({
      vehicles,
      loading,
      selectedVehicleId,
      selectedVehicle,
      refreshVehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      getVehicle,
      selectVehicle,
    }),
    [vehicles, loading, selectedVehicleId, selectedVehicle, refreshVehicles, addVehicle, updateVehicle, deleteVehicle, getVehicle, selectVehicle]
  );

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
