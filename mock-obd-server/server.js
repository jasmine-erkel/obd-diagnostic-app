const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simulated vehicle state
let vehicleState = {
  connected: false,
  engineRunning: false,
  rpm: 0,
  speed: 0,
  coolantTemp: 72, // °F
  engineLoad: 0,
  throttlePosition: 0,
  fuelLevel: 75,
  intakeTemp: 70,
  maf: 0,
  timingAdvance: 15,
  voltage: 12.6,
};

// Active error codes
let activeErrorCodes = [
  { code: 'P0420', timestamp: new Date().toISOString() },
  { code: 'P0171', timestamp: new Date().toISOString() },
];

// Simulate realistic data changes
setInterval(() => {
  if (vehicleState.engineRunning) {
    // Vary RPM between 800-3000
    vehicleState.rpm = Math.floor(800 + Math.random() * 2200);

    // Vary speed between 0-80 mph
    vehicleState.speed = Math.floor(Math.random() * 80);

    // Engine load varies with RPM and speed
    vehicleState.engineLoad = Math.floor(20 + Math.random() * 60);

    // Throttle position
    vehicleState.throttlePosition = Math.floor(Math.random() * 100);

    // MAF varies with engine load
    vehicleState.maf = (2.5 + Math.random() * 4).toFixed(1);

    // Coolant temp gradually increases
    if (vehicleState.coolantTemp < 195) {
      vehicleState.coolantTemp += 0.5;
    }

    // Fuel level gradually decreases
    if (vehicleState.fuelLevel > 0 && Math.random() < 0.01) {
      vehicleState.fuelLevel -= 0.1;
    }
  } else {
    vehicleState.rpm = 0;
    vehicleState.speed = 0;
    vehicleState.engineLoad = 0;
    vehicleState.throttlePosition = 0;
    vehicleState.maf = 0;
  }
}, 100);

// API Endpoints

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Mock OBD-II Server Running',
    version: '1.0.0',
    endpoints: [
      'GET /connect - Connect to OBD device',
      'GET /disconnect - Disconnect from OBD device',
      'GET /status - Get connection status',
      'GET /live-data - Get real-time vehicle data',
      'GET /error-codes - Get active error codes',
      'POST /error-codes/clear - Clear error codes',
      'POST /error-codes/add - Add error code',
      'POST /engine/start - Start engine simulation',
      'POST /engine/stop - Stop engine simulation',
    ],
  });
});

// Connect to OBD device
app.get('/connect', (req, res) => {
  vehicleState.connected = true;
  res.json({
    success: true,
    message: 'Connected to OBD-II device (Mock)',
    deviceInfo: {
      protocol: 'ISO 15765-4 (CAN)',
      vin: '1HGBH41JXMN109186',
    },
  });
});

// Disconnect from OBD device
app.get('/disconnect', (req, res) => {
  vehicleState.connected = false;
  vehicleState.engineRunning = false;
  res.json({
    success: true,
    message: 'Disconnected from OBD-II device',
  });
});

// Get connection status
app.get('/status', (req, res) => {
  res.json({
    connected: vehicleState.connected,
    engineRunning: vehicleState.engineRunning,
  });
});

// Get live data
app.get('/live-data', (req, res) => {
  if (!vehicleState.connected) {
    return res.status(400).json({
      success: false,
      error: 'Not connected to OBD device',
    });
  }

  res.json({
    success: true,
    data: {
      rpm: Math.round(vehicleState.rpm),
      speed: Math.round(vehicleState.speed),
      coolantTemp: Math.round(vehicleState.coolantTemp),
      engineLoad: Math.round(vehicleState.engineLoad),
      throttlePosition: Math.round(vehicleState.throttlePosition),
      fuelLevel: Math.round(vehicleState.fuelLevel),
      intakeTemp: Math.round(vehicleState.intakeTemp),
      maf: parseFloat(vehicleState.maf),
      timingAdvance: vehicleState.timingAdvance,
      voltage: vehicleState.voltage,
    },
    timestamp: new Date().toISOString(),
  });
});

// Get error codes
app.get('/error-codes', (req, res) => {
  if (!vehicleState.connected) {
    return res.status(400).json({
      success: false,
      error: 'Not connected to OBD device',
    });
  }

  res.json({
    success: true,
    codes: activeErrorCodes,
    count: activeErrorCodes.length,
  });
});

// Clear error codes
app.post('/error-codes/clear', (req, res) => {
  if (!vehicleState.connected) {
    return res.status(400).json({
      success: false,
      error: 'Not connected to OBD device',
    });
  }

  activeErrorCodes = [];
  res.json({
    success: true,
    message: 'Error codes cleared',
  });
});

// Add error code (for testing)
app.post('/error-codes/add', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Error code is required',
    });
  }

  activeErrorCodes.push({
    code: code,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Added error code ${code}`,
    codes: activeErrorCodes,
  });
});

// Start engine
app.post('/engine/start', (req, res) => {
  if (!vehicleState.connected) {
    return res.status(400).json({
      success: false,
      error: 'Not connected to OBD device',
    });
  }

  vehicleState.engineRunning = true;
  vehicleState.rpm = 850; // Idle RPM

  res.json({
    success: true,
    message: 'Engine started',
  });
});

// Stop engine
app.post('/engine/stop', (req, res) => {
  vehicleState.engineRunning = false;
  vehicleState.rpm = 0;
  vehicleState.speed = 0;

  res.json({
    success: true,
    message: 'Engine stopped',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚗 Mock OBD-II Server Running`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://YOUR_IP:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  - GET  /connect          - Connect to OBD device`);
  console.log(`  - GET  /disconnect       - Disconnect from OBD device`);
  console.log(`  - GET  /status           - Get connection status`);
  console.log(`  - GET  /live-data        - Get real-time vehicle data`);
  console.log(`  - GET  /error-codes      - Get active error codes`);
  console.log(`  - POST /error-codes/clear - Clear error codes`);
  console.log(`  - POST /error-codes/add   - Add error code`);
  console.log(`  - POST /engine/start      - Start engine simulation`);
  console.log(`  - POST /engine/stop       - Stop engine simulation`);
  console.log(`\n✨ Ready to receive connections!\n`);
});
