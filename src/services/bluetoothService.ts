import {BleManager, Device, Characteristic} from 'react-native-ble-plx';
import {PermissionsAndroid, Platform} from 'react-native';

// OBD-II Service UUID (ELM327 standard)
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';

// OBD-II PID Commands
const OBD_COMMANDS = {
  READ_CODES: '03', // Read stored diagnostic trouble codes
  CLEAR_CODES: '04', // Clear codes and turn off MIL
  ENGINE_RPM: '010C', // Engine RPM
  VEHICLE_SPEED: '010D', // Vehicle speed
  COOLANT_TEMP: '0105', // Engine coolant temperature
  THROTTLE_POS: '0111', // Throttle position
  FUEL_LEVEL: '012F', // Fuel tank level
  INTAKE_TEMP: '010F', // Intake air temperature
};

export interface OBDDevice {
  id: string;
  name: string | null;
  rssi?: number;
}

export interface OBDData {
  rpm?: number;
  speed?: number;
  coolantTemp?: number;
  throttlePos?: number;
  fuelLevel?: number;
  intakeTemp?: number;
}

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private isScanning: boolean = false;

  constructor() {
    this.manager = new BleManager();
  }

  // Request Bluetooth permissions (Android)
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          return (
            granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  }

  // Check Bluetooth state
  async checkBluetoothState(): Promise<boolean> {
    const state = await this.manager.state();
    return state === 'PoweredOn';
  }

  // Scan for OBD-II devices
  async scanForDevices(
    onDeviceFound: (device: OBDDevice) => void,
    durationMs: number = 10000,
  ): Promise<void> {
    if (this.isScanning) {
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    const isBluetoothOn = await this.checkBluetoothState();
    if (!isBluetoothOn) {
      throw new Error('Bluetooth is not enabled');
    }

    this.isScanning = true;
    const foundDevices = new Set<string>();

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        this.stopScan();
        return;
      }

      if (device && device.name && !foundDevices.has(device.id)) {
        // Filter for OBD-II devices (typically have "OBD", "ELM", "OBDII" in name)
        const deviceName = device.name.toUpperCase();
        if (
          deviceName.includes('OBD') ||
          deviceName.includes('ELM') ||
          deviceName.includes('OBDII') ||
          deviceName.includes('VLINK')
        ) {
          foundDevices.add(device.id);
          onDeviceFound({
            id: device.id,
            name: device.name,
            rssi: device.rssi || undefined,
          });
        }
      }
    });

    // Stop scanning after duration
    setTimeout(() => {
      this.stopScan();
    }, durationMs);
  }

  // Stop scanning
  stopScan(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  // Connect to OBD-II device
  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      // Disconnect existing device if any
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Connect to device
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;

      // Initialize ELM327 (send AT commands)
      await this.initializeELM327();

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.connectedDevice = null;
      return false;
    }
  }

  // Initialize ELM327 adapter
  private async initializeELM327(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      // Send initialization commands
      await this.sendCommand('ATZ'); // Reset
      await this.delay(1000);
      await this.sendCommand('ATE0'); // Echo off
      await this.sendCommand('ATL0'); // Linefeeds off
      await this.sendCommand('ATS0'); // Spaces off
      await this.sendCommand('ATH1'); // Headers on
      await this.sendCommand('ATSP0'); // Auto protocol
    } catch (error) {
      console.error('ELM327 initialization error:', error);
    }
  }

  // Send OBD command
  private async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const commandWithReturn = command + '\r';
      const base64Command = Buffer.from(commandWithReturn).toString('base64');

      // Write command
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        OBD_SERVICE_UUID,
        OBD_CHARACTERISTIC_UUID,
        base64Command,
      );

      // Read response
      await this.delay(100);
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        OBD_SERVICE_UUID,
        OBD_CHARACTERISTIC_UUID,
      );

      if (characteristic.value) {
        return Buffer.from(characteristic.value, 'base64').toString('utf-8');
      }

      return '';
    } catch (error) {
      console.error('Command error:', error);
      return '';
    }
  }

  // Read error codes
  async readErrorCodes(): Promise<string[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const response = await this.sendCommand(OBD_COMMANDS.READ_CODES);
      return this.parseErrorCodes(response);
    } catch (error) {
      console.error('Read codes error:', error);
      return [];
    }
  }

  // Parse error codes from response
  private parseErrorCodes(response: string): string[] {
    const codes: string[] = [];
    // Remove spaces and split by line
    const lines = response.replace(/\s/g, '').split('\r');

    for (const line of lines) {
      // Look for response starting with 43 (response to mode 03)
      if (line.startsWith('43')) {
        const hexCodes = line.substring(2);
        // Each code is 4 hex digits
        for (let i = 0; i < hexCodes.length; i += 4) {
          const hexCode = hexCodes.substring(i, i + 4);
          if (hexCode !== '0000') {
            const code = this.hexToErrorCode(hexCode);
            if (code) {
              codes.push(code);
            }
          }
        }
      }
    }

    return codes;
  }

  // Convert hex to error code format
  private hexToErrorCode(hex: string): string | null {
    if (hex.length !== 4) return null;

    const firstByte = parseInt(hex.substring(0, 2), 16);
    const secondByte = parseInt(hex.substring(2, 4), 16);

    // Determine prefix based on first two bits
    const prefixBits = (firstByte >> 6) & 0x03;
    const prefixes = ['P', 'C', 'B', 'U'];
    const prefix = prefixes[prefixBits];

    // Get remaining digits
    const digit1 = (firstByte >> 4) & 0x03;
    const digit2 = firstByte & 0x0f;
    const digit3 = (secondByte >> 4) & 0x0f;
    const digit4 = secondByte & 0x0f;

    return `${prefix}${digit1}${digit2.toString(16).toUpperCase()}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}`;
  }

  // Read live OBD data
  async readLiveData(): Promise<OBDData> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    const data: OBDData = {};

    try {
      // Read RPM
      const rpmResponse = await this.sendCommand(OBD_COMMANDS.ENGINE_RPM);
      data.rpm = this.parseRPM(rpmResponse);

      // Read Speed
      const speedResponse = await this.sendCommand(OBD_COMMANDS.VEHICLE_SPEED);
      data.speed = this.parseSpeed(speedResponse);

      // Read Coolant Temp
      const tempResponse = await this.sendCommand(OBD_COMMANDS.COOLANT_TEMP);
      data.coolantTemp = this.parseTemperature(tempResponse);

      // Read Throttle Position
      const throttleResponse = await this.sendCommand(OBD_COMMANDS.THROTTLE_POS);
      data.throttlePos = this.parseThrottlePosition(throttleResponse);

      // Read Fuel Level
      const fuelResponse = await this.sendCommand(OBD_COMMANDS.FUEL_LEVEL);
      data.fuelLevel = this.parseFuelLevel(fuelResponse);
    } catch (error) {
      console.error('Read live data error:', error);
    }

    return data;
  }

  // Parse RPM from response
  private parseRPM(response: string): number {
    const match = response.match(/41 0C ([0-9A-F]{2}) ([0-9A-F]{2})/);
    if (match) {
      const a = parseInt(match[1], 16);
      const b = parseInt(match[2], 16);
      return ((a * 256) + b) / 4;
    }
    return 0;
  }

  // Parse speed from response
  private parseSpeed(response: string): number {
    const match = response.match(/41 0D ([0-9A-F]{2})/);
    if (match) {
      return parseInt(match[1], 16);
    }
    return 0;
  }

  // Parse temperature from response
  private parseTemperature(response: string): number {
    const match = response.match(/41 05 ([0-9A-F]{2})/);
    if (match) {
      return parseInt(match[1], 16) - 40;
    }
    return 0;
  }

  // Parse throttle position from response
  private parseThrottlePosition(response: string): number {
    const match = response.match(/41 11 ([0-9A-F]{2})/);
    if (match) {
      return (parseInt(match[1], 16) * 100) / 255;
    }
    return 0;
  }

  // Parse fuel level from response
  private parseFuelLevel(response: string): number {
    const match = response.match(/41 2F ([0-9A-F]{2})/);
    if (match) {
      return (parseInt(match[1], 16) * 100) / 255;
    }
    return 0;
  }

  // Clear error codes
  async clearErrorCodes(): Promise<boolean> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await this.sendCommand(OBD_COMMANDS.CLEAR_CODES);
      return true;
    } catch (error) {
      console.error('Clear codes error:', error);
      return false;
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.connectedDevice = null;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  // Get connected device
  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  // Utility: delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup
  destroy(): void {
    this.stopScan();
    this.disconnect();
    this.manager.destroy();
  }
}

export const bluetoothService = new BluetoothService();
