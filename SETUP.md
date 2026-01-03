# Setup Guide for Intelligent Irrigation Controller

This guide will walk you through setting up and running the Intelligent Irrigation Controller system.

## Prerequisites

### Software
- Python 3.8 or higher
- Node.js (optional, for serving frontend)
- PlatformIO or Arduino IDE (for firmware development)
- Git (for cloning the repository)

### Hardware (for full deployment)
- ESP32 Development Board
- 4x DHT22 Temperature/Humidity sensors
- 4x Capacitive soil moisture sensors
- Relay modules for pump and valves
- Power supplies
- Water pump and solenoid valves

## Quick Start (Demo Mode)

You can test the system without hardware using the simulation mode:

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Backend Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 3. Run the Simulator (in a new terminal)

```bash
cd backend
python simulator.py
```

This will generate simulated sensor data and send it to the backend.

### 4. Open the Dashboard

Open `frontend/index.html` in your web browser, or serve it using a simple HTTP server:

```bash
# Python 3
cd frontend
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## Full Setup with Hardware

### Step 1: Train the AI Model (Optional)

If you want to train your own model:

```bash
cd models
python train_model.py
python convert_to_tflite.py
python convert_model_to_header.py
```

A pre-trained model will be generated. For production, train with real sensor data.

### Step 2: Prepare the Firmware

1. Install PlatformIO (recommended) or Arduino IDE
2. Install ESP32 board support
3. Convert the TensorFlow Lite model to a C header:
   ```bash
   python models/convert_model_to_header.py
   ```
4. Edit `firmware/main/main.cpp` and configure:
   - WiFi SSID and password
   - Server URL (your backend server IP)
5. Connect hardware according to pin configuration in `firmware/README.md`
6. Build and upload firmware to ESP32

### Step 3: Configure Backend

Edit `backend/app.py` if needed to change:
- Port number (default: 5000)
- CORS settings
- Database configuration (currently using in-memory storage)

### Step 4: Configure Frontend

Edit `frontend/js/config.js` to update:
- API URL (if backend is not on localhost:5000)
- Zone names
- Alert thresholds

### Step 5: Start the System

1. Start backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Power on ESP32 (ensure WiFi credentials are configured)

3. Open dashboard in browser

## Configuration

### Zone Configuration

Zones can be configured via the API or by editing `backend/app.py`:

```python
zone_configs = {
    0: {'name': 'Zone 1 - Tomatoes', 'enabled': True, 'min_moisture': 40},
    # ... other zones
}
```

### Sensor Calibration

Calibrate soil moisture sensors in the firmware code (`firmware/main/main.cpp`):

```cpp
float readSoilMoisture(int pin) {
    int raw = analogRead(pin);
    // Adjust DRY_VALUE and WET_VALUE based on your sensor
    float percentage = map(raw, DRY_VALUE, WET_VALUE, 0, 100);
    return constrain(percentage, 0, 100);
}
```

### AI Model Parameters

Modify watering thresholds in firmware:

```cpp
zones[i].needs_watering = (zones[i].soil_moisture < 40.0) && 
                          (zones[i].water_prediction > 20.0);
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/

# Get zones
curl http://localhost:5000/api/zones

# Get sensor data
curl http://localhost:5000/api/sensor-data

# Get stats
curl http://localhost:5000/api/stats
```

### Test with Simulator

Run the simulator to test the full system without hardware:

```bash
cd backend
python simulator.py
```

Watch the dashboard update in real-time.

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.8+)

### Frontend not connecting
- Verify backend is running
- Check browser console for errors
- Update `CONFIG.API_URL` in `frontend/js/config.js`
- Ensure CORS is enabled in backend

### ESP32 not connecting
- Verify WiFi credentials are correct
- Check WiFi signal strength (ESP32 only supports 2.4GHz)
- Verify server URL is accessible from ESP32's network
- Check serial monitor for error messages

### Sensors not reading
- Verify wiring connections
- Check sensor power supply
- Calibrate sensors based on your hardware
- Check serial output for error messages

### Model inference fails
- Verify model file is correctly converted
- Check tensor arena size in firmware (increase if needed)
- Ensure input normalization matches training data

## Production Deployment

For production deployment:

1. **Use a proper database** instead of in-memory storage
2. **Add authentication** for API endpoints
3. **Use HTTPS** for secure communication
4. **Set up logging** and monitoring
5. **Add data backup** and recovery
6. **Deploy backend** on a server (not localhost)
7. **Use a web server** (nginx, Apache) to serve frontend
8. **Set up SSL certificates** for secure connections
9. **Configure firewall** rules appropriately
10. **Add error handling** and retry logic

## Support

For issues and questions:
- Check the documentation in each component's README
- Review code comments for configuration options
- Check hardware connections and pin assignments

## License

MIT License

