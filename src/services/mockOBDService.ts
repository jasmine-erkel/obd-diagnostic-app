import {OBDData} from './bluetoothService';

// Mock OBD Service for testing without a real device
// This simulates realistic vehicle data with some randomness

export class MockOBDService {
  private baseValues = {
    rpm: 850,
    speed: 0,
    coolantTemp: 85,
    throttlePos: 0,
    fuelLevel: 75,
    intakeTemp: 35,
  };

  private isEngineRunning = true;
  private isDriving = false;

  // Simulate engine starting
  startEngine(): void {
    this.isEngineRunning = true;
    this.baseValues.rpm = 850;
  }

  // Simulate engine stopping
  stopEngine(): void {
    this.isEngineRunning = false;
    this.baseValues.rpm = 0;
    this.baseValues.speed = 0;
    this.baseValues.throttlePos = 0;
  }

  // Simulate driving
  startDriving(): void {
    this.isDriving = true;
  }

  stopDriving(): void {
    this.isDriving = false;
  }

  // Get mock live data with realistic variations
  async readLiveData(): Promise<OBDData> {
    const data: OBDData = {};

    if (this.isEngineRunning) {
      // RPM variations
      if (this.isDriving) {
        data.rpm = this.baseValues.rpm + Math.random() * 2500 + 1000; // 1850-4350 RPM
      } else {
        data.rpm = this.baseValues.rpm + (Math.random() * 200 - 100); // Idle: 750-950 RPM
      }

      // Speed variations
      if (this.isDriving) {
        data.speed = Math.random() * 80 + 20; // 20-100 km/h
      } else {
        data.speed = 0;
      }

      // Throttle position
      if (this.isDriving) {
        data.throttlePos = Math.random() * 60 + 20; // 20-80%
      } else {
        data.throttlePos = 0;
      }

      // Coolant temperature (increases slightly when driving)
      if (this.isDriving) {
        this.baseValues.coolantTemp = Math.min(95, this.baseValues.coolantTemp + 0.1);
      } else {
        this.baseValues.coolantTemp = Math.max(85, this.baseValues.coolantTemp - 0.05);
      }
      data.coolantTemp = this.baseValues.coolantTemp + (Math.random() * 4 - 2); // ±2°C

      // Fuel level (decreases slowly when driving)
      if (this.isDriving) {
        this.baseValues.fuelLevel = Math.max(0, this.baseValues.fuelLevel - 0.01);
      }
      data.fuelLevel = this.baseValues.fuelLevel + (Math.random() * 2 - 1); // ±1%

      // Intake air temperature
      data.intakeTemp = this.baseValues.intakeTemp + (Math.random() * 10 - 5); // ±5°C
    } else {
      // Engine off
      data.rpm = 0;
      data.speed = 0;
      data.throttlePos = 0;
      data.coolantTemp = Math.max(20, this.baseValues.coolantTemp - 0.2); // Cooling down
      data.fuelLevel = this.baseValues.fuelLevel;
      data.intakeTemp = 25; // Ambient temperature
    }

    // Ensure values are within realistic ranges
    data.rpm = Math.max(0, Math.min(8000, data.rpm || 0));
    data.speed = Math.max(0, Math.min(200, data.speed || 0));
    data.throttlePos = Math.max(0, Math.min(100, data.throttlePos || 0));
    data.coolantTemp = Math.max(-40, Math.min(150, data.coolantTemp || 0));
    data.fuelLevel = Math.max(0, Math.min(100, data.fuelLevel || 0));
    data.intakeTemp = Math.max(-40, Math.min(100, data.intakeTemp || 0));

    // Simulate network delay
    await this.delay(50);

    return data;
  }

  // Mock error codes - returns array of error code strings
  async readErrorCodes(): Promise<string[]> {
    // Simulate some common error codes
    const mockCodes = ['P0420', 'P0171', 'P0301'];

    // Randomly return 0-3 codes
    const numCodes = Math.floor(Math.random() * 4);
    return mockCodes.slice(0, numCodes);
  }

  // Mock clear codes
  async clearErrorCodes(): Promise<boolean> {
    await this.delay(100);
    return true;
  }

  // Set custom base values for testing specific scenarios
  setBaseValues(values: Partial<typeof this.baseValues>): void {
    this.baseValues = {...this.baseValues, ...values};
  }

  // Get current engine state
  getEngineState(): {isRunning: boolean; isDriving: boolean} {
    return {
      isRunning: this.isEngineRunning,
      isDriving: this.isDriving,
    };
  }

  // Utility delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockOBDService = new MockOBDService();
