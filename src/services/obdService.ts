// OBD-II Service for connecting to mock OBD server or real OBD device
//
// For Mock Server: Update MOCK_SERVER_URL with your Mac's IP address
// For Real Device: Integrate with react-native-ble-plx or similar

// CONFIGURATION: Update this with your Mac's IP address when running mock server
// Find your IP: System Preferences > Network > Wi-Fi > Details > TCP/IP
const MOCK_SERVER_URL = 'http://192.168.86.37:3001';

export interface OBDLiveData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  engineLoad: number;
  throttlePosition: number;
  fuelLevel: number;
  intakeTemp: number;
  maf: number;
  timingAdvance?: number;
  voltage?: number;
}

export interface OBDErrorCode {
  code: string;
  timestamp: string;
}

export interface OBDConnectionStatus {
  connected: boolean;
  engineRunning: boolean;
  deviceInfo?: {
    protocol?: string;
    vin?: string;
  };
}

class OBDService {
  private baseUrl: string = MOCK_SERVER_URL;
  private pollingInterval: NodeJS.Timeout | null = null;
  private liveDataCallback: ((data: OBDLiveData) => void) | null = null;

  // Set custom server URL (for different environments)
  setServerUrl(url: string) {
    this.baseUrl = url;
  }

  // Connect to OBD device
  async connect(): Promise<{success: boolean; message: string; deviceInfo?: any}> {
    try {
      const response = await fetch(`${this.baseUrl}/connect`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Connect Error:', error);
      return {
        success: false,
        message: `Failed to connect to OBD server at ${this.baseUrl}. Make sure the mock server is running.`,
      };
    }
  }

  // Disconnect from OBD device
  async disconnect(): Promise<{success: boolean; message: string}> {
    this.stopLiveDataPolling();

    try {
      const response = await fetch(`${this.baseUrl}/disconnect`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Disconnect Error:', error);
      return {
        success: false,
        message: 'Failed to disconnect',
      };
    }
  }

  // Get connection status
  async getStatus(): Promise<OBDConnectionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Status Error:', error);
      return {
        connected: false,
        engineRunning: false,
      };
    }
  }

  // Get live data once
  async getLiveData(): Promise<OBDLiveData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/live-data`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('OBD Live Data Error:', error);
      return null;
    }
  }

  // Start polling live data
  startLiveDataPolling(callback: (data: OBDLiveData) => void, intervalMs: number = 500) {
    this.liveDataCallback = callback;

    this.pollingInterval = setInterval(async () => {
      const data = await this.getLiveData();
      if (data && this.liveDataCallback) {
        this.liveDataCallback(data);
      }
    }, intervalMs);
  }

  // Stop polling live data
  stopLiveDataPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.liveDataCallback = null;
  }

  // Get error codes
  async getErrorCodes(): Promise<OBDErrorCode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/error-codes`);
      const result = await response.json();

      if (result.success) {
        return result.codes;
      }

      return [];
    } catch (error) {
      console.error('OBD Error Codes Error:', error);
      return [];
    }
  }

  // Clear error codes
  async clearErrorCodes(): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/error-codes/clear`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Clear Codes Error:', error);
      return {
        success: false,
        message: 'Failed to clear error codes',
      };
    }
  }

  // Add error code (for testing)
  async addErrorCode(code: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/error-codes/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({code}),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Add Code Error:', error);
      return {
        success: false,
        message: 'Failed to add error code',
      };
    }
  }

  // Start engine simulation
  async startEngine(): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/engine/start`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Start Engine Error:', error);
      return {
        success: false,
        message: 'Failed to start engine',
      };
    }
  }

  // Stop engine simulation
  async stopEngine(): Promise<{success: boolean; message: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/engine/stop`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OBD Stop Engine Error:', error);
      return {
        success: false,
        message: 'Failed to stop engine',
      };
    }
  }

  // Check if server is reachable
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {timeout: 3000} as any);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const obdService = new OBDService();
