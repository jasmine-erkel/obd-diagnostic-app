# OBD-II Diagnostic App

> A React Native mobile app that connects to OBD-II adapters over Bluetooth to read live vehicle telemetry, display diagnostic trouble codes, and provide AI-assisted troubleshooting. Ships with a standalone vehicle simulator so the full stack can be developed without a car.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Bluetooth](https://img.shields.io/badge/Bluetooth-LE-0082FC?logo=bluetooth&logoColor=white) ![Platform](https://img.shields.io/badge/platform-iOS_%7C_Android-lightgrey)

## Demo

<!-- TODO: add screenshots of Diagnostics screen, AI Assistant, and Vehicle List -->
*Screenshots coming soon.*

## Features

**Vehicle management** — CRUD on a garage of vehicles: make, model, year, VIN (with 17-char validation), nickname, color, mileage, and photos from camera or library. Persisted via AsyncStorage.

**Maintenance records** — Per-vehicle service history (oil changes, brakes, inspections, repairs, etc.) with date, mileage, cost, service provider, and parts used across 10 categorized service types.

**Live diagnostics** — Real-time engine parameters (RPM, speed, coolant temp, engine load, throttle, fuel level, IAT, MAF) plus active DTCs with severity classification. Includes 30+ built-in OBD-II code definitions across P/B/C/U categories, with DTC clearing support.

**Bluetooth OBD-II communication** — Connects to ELM327-compatible adapters over BLE. Handles device discovery/filtering, the full ELM327 initialization sequence (ATZ, ATE0, ATL0, ATS0, ATH1, ATSP0), standard PID commands, and hex-response parsing. Manages Android 12+ Bluetooth permissions.

**AI assistant** — Chat UI for diagnostic questions with vehicle-aware context. Tap any DTC for an AI-powered explanation. Works with OpenAI/Anthropic-compatible chat completion APIs.

**Vehicle simulator** — A standalone Express.js server (`mock-obd-server/`) simulates an OBD-II device over HTTP: realistic telemetry updating every 100ms, engine lifecycle (start/stop with gradual coolant warm-up), DTC management, and 9 REST endpoints mirroring real adapter behavior. There's also an in-app `MockOBDService` for UI development without the server.

## Tech Stack

- **React Native** 0.83 + **React** 19 + **TypeScript**
- **react-native-ble-plx** — BLE communication
- **React Navigation** — bottom tabs with nested stacks
- **Context API** — state management (Vehicle, OBD, AI, User)
- **AsyncStorage** — local persistence
- **Express.js** — mock OBD-II server

## Architecture

```
┌────────────────────────────────┐
│   React Native App (iOS/Android)
│   ├── Context providers        │
│   ├── Screens + Navigation     │
│   └── Services                 │
│       ├── bluetoothService ────┼─── BLE → ELM327 adapter → vehicle
│       ├── obdService      ─────┼─── HTTP → mock-obd-server
│       ├── mockOBDService  ─────┼─── in-process mock data
│       └── aiService       ─────┼─── HTTPS → OpenAI/Anthropic
└────────────────────────────────┘
```

See [`SETUP.md`](SETUP.md) for API key configuration and [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for iOS/Android build notes.

## Getting Started

**Prerequisites:** Node ≥ 20, Xcode (iOS) or Android Studio, and the standard [React Native environment](https://reactnative.dev/docs/set-up-your-environment).

```bash
git clone https://github.com/jasmine-erkel/obd-diagnostic-app.git
cd obd-diagnostic-app
npm install

# iOS only
bundle install && cd ios && bundle exec pod install && cd ..
```

**Run the simulator** (optional, for dev without a physical adapter):

```bash
cd mock-obd-server && npm install && npm start   # starts on :3001
```

Update `src/services/obdService.ts` with your machine's local IP so the mobile app can reach it.

**Start the app:**

```bash
npm start
# then, in another terminal:
npm run ios     # or npm run android
```

## Simulator API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/connect` | Connect to the simulated OBD-II device |
| GET | `/disconnect` | Disconnect |
| GET | `/status` | Connection and engine state |
| GET | `/live-data` | Real-time vehicle telemetry |
| GET | `/error-codes` | Active diagnostic trouble codes |
| POST | `/error-codes/clear` | Clear all stored DTCs |
| POST | `/error-codes/add` | Add a DTC for testing (`{ "code": "P0301" }`) |
| POST | `/engine/start` | Start engine simulation |
| POST | `/engine/stop` | Stop engine simulation |

## My Role

Collaborative build with **Joshua Erkel** (roughly 50/50 commit split). I owned the Bluetooth service layer, OBD code parsing, AI assistant integration, and the mock simulator server. Shared work on navigation, contexts, and screen implementations.

## License

MIT
