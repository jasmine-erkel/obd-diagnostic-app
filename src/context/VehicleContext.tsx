import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Vehicle} from '../types/vehicle';
import {vehicleStorage} from '../services/vehicleStorage';

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Vehicle) => Promise<boolean>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<boolean>;
  deleteVehicle: (id: string) => Promise<boolean>;
  getVehicle: (id: string) => Vehicle | undefined;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshVehicles = async () => {
    setLoading(true);
    try {
      const loadedVehicles = await vehicleStorage.getAllVehicles();
      setVehicles(loadedVehicles);
    } catch (error) {
      console.error('Error refreshing vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle: Vehicle): Promise<boolean> => {
    const success = await vehicleStorage.saveVehicle(vehicle);
    if (success) {
      await refreshVehicles();
    }
    return success;
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<boolean> => {
    const success = await vehicleStorage.updateVehicle(id, updates);
    if (success) {
      await refreshVehicles();
    }
    return success;
  };

  const deleteVehicle = async (id: string): Promise<boolean> => {
    const success = await vehicleStorage.deleteVehicle(id);
    if (success) {
      await refreshVehicles();
    }
    return success;
  };

  const getVehicle = (id: string): Vehicle | undefined => {
    return vehicles.find(v => v.id === id);
  };

  useEffect(() => {
    refreshVehicles();
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        loading,
        refreshVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicle,
      }}>
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
