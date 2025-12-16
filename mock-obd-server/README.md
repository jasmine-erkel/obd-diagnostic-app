# Mock OBD-II Server

A simple Express.js server that simulates an OBD-II device for testing the diagnostic app.

## Features

- ✅ Simulates real-time vehicle data (RPM, Speed, Temp, etc.)
- ✅ Manages error codes (add, view, clear)
- ✅ Engine start/stop simulation
- ✅ Realistic data variation
- ✅ CORS enabled for app connections

## Installation

```bash
cd mock-obd-server
npm install
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Connection Management
- `GET /connect` - Connect to mock OBD device
- `GET /disconnect` - Disconnect from device
- `GET /status` - Get connection status

### Data Retrieval
- `GET /live-data` - Get real-time vehicle data
  - Returns: RPM, Speed, Coolant Temp, Engine Load, Throttle Position, Fuel Level, etc.

### Error Codes
- `GET /error-codes` - Get active error codes
- `POST /error-codes/clear` - Clear all error codes
- `POST /error-codes/add` - Add an error code
  ```json
  {
    "code": "P0301"
  }
  ```

### Engine Control
- `POST /engine/start` - Start engine simulation (realistic data)
- `POST /engine/stop` - Stop engine simulation (data goes to 0)

## Testing with cURL

```bash
# Connect to device
curl http://localhost:3001/connect

# Start engine
curl -X POST http://localhost:3001/engine/start

# Get live data
curl http://localhost:3001/live-data

# Get error codes
curl http://localhost:3001/error-codes

# Add error code
curl -X POST http://localhost:3001/error-codes/add \
  -H "Content-Type: application/json" \
  -d '{"code":"P0301"}'

# Clear codes
curl -X POST http://localhost:3001/error-codes/clear

# Stop engine
curl -X POST http://localhost:3001/engine/stop

# Disconnect
curl http://localhost:3001/disconnect
```

## Using with the App

1. Start the mock server
2. Find your Mac's IP address: `System Preferences > Network`
3. Update the OBD service in the app to point to: `http://YOUR_IP:3001`
4. The app can now connect and receive real-time data!

## How It Works

- **Realistic Simulation**: Data varies realistically when engine is running
- **Auto-updates**: Vehicle data updates every 100ms
- **State Management**: Maintains connection and engine state
- **Pre-loaded Errors**: Starts with P0420 and P0171 error codes

## Example Response

```json
{
  "success": true,
  "data": {
    "rpm": 1850,
    "speed": 45,
    "coolantTemp": 195,
    "engineLoad": 42,
    "throttlePosition": 35,
    "fuelLevel": 75,
    "intakeTemp": 85,
    "maf": 4.2,
    "timingAdvance": 15,
    "voltage": 12.6
  },
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```
