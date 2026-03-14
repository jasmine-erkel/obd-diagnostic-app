# OBD-II Diagnostic App

A mobile diagnostic tool built with React Native that connects to OBD-II adapters over Bluetooth to read real-time vehicle data, display diagnostic trouble codes (DTCs), and provide AI-assisted troubleshooting. Includes a standalone vehicle simulator server and an in-app mock service for development and testing without physical hardware.

## Features

### Vehicle Management
- Full CRUD operations for managing a garage of vehicles
- Stores make, model, year, VIN, nickname, color, and mileage
- Vehicle photo capture and selection via camera or photo library
- Form validation including 17-character VIN verification
- Persistent local storage with AsyncStorage

### Maintenance Records
- Track service history per vehicle (oil changes, tire rotations, brake service, inspections, repairs, and more)
- Log date, mileage, cost, service provider, and parts used for each record
- 10 categorized maintenance types with full CRUD support

### User Profiles
- Local user account with profile details and avatar
- Configurable settings for notifications and theme (light, dark, auto)
- Dashboard stats tracking vehicle count, scan count, and issues resolved

### Live Diagnostics
- Real-time display of engine parameters: RPM, speed, coolant temperature, engine load, throttle position, fuel level, intake air temperature, and MAF sensor readings
- Reads and displays active diagnostic trouble codes with severity classification (critical, warning, info)
- Supports clearing DTCs through the OBD-II interface
- 30+ built-in OBD-II code definitions spanning powertrain (P), body (B), chassis (C), and network (U) categories

### Bluetooth OBD-II Communication
- Connects to ELM327-compatible OBD-II adapters over Bluetooth Low Energy
- Scans for and filters OBD-II devices by name (OBD, ELM, VLINK)
- Sends standard OBD-II PID commands and parses hex responses into human-readable values
- Full ELM327 initialization sequence (ATZ, ATE0, ATL0, ATS0, ATH1, ATSP0)
- Handles Android Bluetooth permission requests (API 31+ and legacy)
- Parses raw DTC hex responses into standard code format (P/C/B/U prefixes)

### AI Assistant
- Chat interface for asking diagnostic questions about error codes and vehicle issues
- Vehicle-aware context -- select a vehicle so the AI can tailor responses to your specific make and model
- Tap any DTC in the diagnostics view to get an AI-powered explanation
- Persistent chat history across sessions
- Ready to connect to OpenAI, Anthropic, or any compatible chat completion API

### OBD-II Vehicle Simulator

The project includes a standalone Express.js server (`mock-obd-server/`) that simulates an OBD-II device over HTTP. This allows full end-to-end development and testing of the app without requiring a physical OBD-II adapter or vehicle.

The simulator provides:

- **Realistic engine telemetry** -- RPM, speed, coolant temperature, engine load, throttle position, fuel level, intake air temperature, MAF, timing advance, and battery voltage all update at 100ms intervals with realistic variation
- **Engine lifecycle simulation** -- start and stop the engine to toggle between idle/running data and zero-state readings, with coolant temperature that gradually warms up over time
- **DTC management** -- ships with pre-loaded error codes (P0420, P0171), supports adding arbitrary codes for testing, and clearing all codes
- **Connection state management** -- enforces a connect/disconnect lifecycle so the app can be tested against both connected and disconnected states
- **Full REST API** with 9 endpoints mirroring real OBD-II adapter behavior

See [`mock-obd-server/README.md`](mock-obd-server/README.md) for endpoint documentation and usage examples.

### In-App Mock Service

In addition to the HTTP simulator, the app includes a `MockOBDService` class (`src/services/mockOBDService.ts`) that generates realistic telemetry data directly in-app. This supports idle vs. driving simulation, gradual coolant warm-up and cool-down, fuel consumption modeling, and value clamping to realistic ranges. Useful for UI development when the mock server is not running.

## Tech Stack

- **React Native** 0.83 with **React** 19
- **TypeScript** for type safety across the entire codebase
- **react-native-ble-plx** for Bluetooth Low Energy communication with OBD-II adapters
- **react-native-image-picker** for vehicle photo capture
- **React Navigation** -- bottom tab navigator with nested stack navigation
- **Context API** for state management (Vehicle, OBD, AI, User contexts)
- **AsyncStorage** for local data persistence
- **Express.js** for the mock OBD-II server

## Project Structure

```
src/
  components/
    common/                 Button, Card, Input, ImagePicker, Skeleton
    vehicles/               VehicleCard, VehicleCardSkeleton, VehicleSelector
  config.example.ts         API key configuration template
  constants/
    obdCodes.ts             OBD-II DTC definitions and lookup utilities
    theme.ts                Colors, spacing, typography
  context/
    AIContext.tsx            AI chat state management
    OBDContext.tsx           OBD connection and live data state
    UserContext.tsx          User profile and settings state
    VehicleContext.tsx       Vehicle garage state
  navigation/
    TabNavigator.tsx         Bottom tab navigation (Vehicles, Diagnostics, AI, Profile)
    VehiclesStackNavigator.tsx
    types.ts                Navigation type definitions
  screens/
    AddVehicleScreen.tsx
    AIAssistantScreen.tsx
    DiagnosticsScreen.tsx
    MaintenanceRecordsScreen.tsx
    ProfileScreen.tsx
    VehicleDetailScreen.tsx
    VehicleListScreen.tsx
  services/
    aiService.ts            AI API integration (OpenAI/Anthropic-ready)
    bluetoothService.ts     BLE communication with ELM327 OBD-II adapters
    mockOBDService.ts       In-app mock data generator for testing
    obdService.ts           HTTP client for the mock OBD-II server
    userStorage.ts          User profile, stats, and settings persistence
    vehicleStorage.ts       Vehicle data persistence
  types/
    ai.ts                   AI chat models
    maintenance.ts          Maintenance record and service type models
    user.ts                 User profile, stats, and settings models
    vehicle.ts              Vehicle and DTC models
  utils/
    uuid.ts                 ID generation
    validation.ts           Form validation

mock-obd-server/
  server.js                 Express server simulating an OBD-II device
  package.json
  README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment))
- Xcode (for iOS) or Android Studio (for Android)

### Installation

```bash
git clone <repository-url>
cd obd-diagnostic-app
npm install
```

For iOS:
```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

### Running the Vehicle Simulator

```bash
cd mock-obd-server
npm install
npm start
```

The server starts on `http://localhost:3001`. Update the server URL in `src/services/obdService.ts` with your machine's local IP address so the mobile app can reach it over the network.

### Running the App

Start the Metro bundler:
```bash
npm start
```

In a separate terminal:
```bash
# iOS
npm run ios

# Android
npm run android
```

### Enabling AI Features

The AI assistant works in mock mode by default. To connect a real AI backend:

1. Copy `src/config.example.ts` to `src/config.local.ts`
2. Add your API key (the local config file is gitignored)
3. Update the configuration in `src/services/aiService.ts`

Compatible with any API that follows the OpenAI chat completions format.

## Simulator API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/connect` | Connect to the simulated OBD-II device |
| GET | `/disconnect` | Disconnect from the device |
| GET | `/status` | Get connection and engine state |
| GET | `/live-data` | Get real-time vehicle telemetry |
| GET | `/error-codes` | Get active diagnostic trouble codes |
| POST | `/error-codes/clear` | Clear all stored DTCs |
| POST | `/error-codes/add` | Add a DTC for testing (`{ "code": "P0301" }`) |
| POST | `/engine/start` | Start the engine simulation |
| POST | `/engine/stop` | Stop the engine simulation |

## License

MIT
