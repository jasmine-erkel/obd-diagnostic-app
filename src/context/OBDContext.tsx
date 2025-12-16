import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {obdService, OBDLiveData, OBDErrorCode} from '../services/obdService';

interface OBDContextType {
  connected: boolean;
  engineRunning: boolean;
  liveData: OBDLiveData | null;
  errorCodes: OBDErrorCode[];
  connect: () => Promise<{success: boolean; message: string}>;
  disconnect: () => Promise<void>;
  refreshErrorCodes: () => Promise<void>;
  clearErrorCodes: () => Promise<{success: boolean; message: string}>;
  startEngine: () => Promise<{success: boolean; message: string}>;
  stopEngine: () => Promise<{success: boolean; message: string}>;
  checkServerConnection: () => Promise<boolean>;
}

const OBDContext = createContext<OBDContextType | undefined>(undefined);

export const OBDProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [connected, setConnected] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);
  const [liveData, setLiveData] = useState<OBDLiveData | null>(null);
  const [errorCodes, setErrorCodes] = useState<OBDErrorCode[]>([]);

  // Check status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await obdService.getStatus();
      setConnected(status.connected);
      setEngineRunning(status.engineRunning);
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Start live data polling when connected
  useEffect(() => {
    if (connected) {
      obdService.startLiveDataPolling((data) => {
        setLiveData(data);
      }, 500);

      // Refresh error codes when connected
      refreshErrorCodes();
    } else {
      obdService.stopLiveDataPolling();
      setLiveData(null);
    }

    return () => {
      obdService.stopLiveDataPolling();
    };
  }, [connected]);

  const connect = async () => {
    const result = await obdService.connect();
    if (result.success) {
      setConnected(true);
      await refreshErrorCodes();
    }
    return result;
  };

  const disconnect = async () => {
    const result = await obdService.disconnect();
    setConnected(false);
    setEngineRunning(false);
    setLiveData(null);
  };

  const refreshErrorCodes = async () => {
    const codes = await obdService.getErrorCodes();
    setErrorCodes(codes);
  };

  const clearErrorCodes = async () => {
    const result = await obdService.clearErrorCodes();
    if (result.success) {
      setErrorCodes([]);
    }
    return result;
  };

  const startEngine = async () => {
    const result = await obdService.startEngine();
    if (result.success) {
      setEngineRunning(true);
    }
    return result;
  };

  const stopEngine = async () => {
    const result = await obdService.stopEngine();
    if (result.success) {
      setEngineRunning(false);
    }
    return result;
  };

  const checkServerConnection = async () => {
    return await obdService.checkConnection();
  };

  return (
    <OBDContext.Provider
      value={{
        connected,
        engineRunning,
        liveData,
        errorCodes,
        connect,
        disconnect,
        refreshErrorCodes,
        clearErrorCodes,
        startEngine,
        stopEngine,
        checkServerConnection,
      }}>
      {children}
    </OBDContext.Provider>
  );
};

export const useOBD = (): OBDContextType => {
  const context = useContext(OBDContext);
  if (!context) {
    throw new Error('useOBD must be used within an OBDProvider');
  }
  return context;
};
