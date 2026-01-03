# Quick Start Guide

Get the Intelligent Irrigation Controller running in 5 minutes!

## Option 1: Demo Mode (No Hardware Required)

### Windows

1. Install Python 3.8+ from python.org
2. Open PowerShell in the project directory
3. Install dependencies:
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```
4. Run the demo:
   ```powershell
   # Double-click start_demo.bat
   # OR run manually:
   start cmd /k "cd backend && python app.py"
   # Wait 3 seconds, then in a new terminal:
   cd backend
   python simulator.py
   ```
5. Open `frontend/index.html` in your web browser

### Linux/Mac

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```
3. Run the demo:
   ```bash
   bash start_demo.sh
   # OR manually:
   cd backend
   python3 app.py &
   python3 simulator.py &
   ```
4. Open `frontend/index.html` in your web browser

## Option 2: With Hardware (ESP32)

### Prerequisites
- ESP32 development board
- PlatformIO or Arduino IDE installed
- Sensors and relays connected

### Steps

1. **Train the AI Model** (first time only):
   ```bash
   cd models
   python train_model.py
   python convert_to_tflite.py
   python convert_model_to_header.py
   ```

2. **Configure Firmware**:
   - Edit `firmware/main/main.cpp`
   - Set WiFi SSID and password
   - Set server URL (your computer's IP:5000)

3. **Upload Firmware**:
   ```bash
   cd firmware
   pio run --target upload
   ```

4. **Start Backend**:
   ```bash
   cd backend
   python app.py
   ```

5. **Open Dashboard**:
   Open `frontend/index.html` in browser

## Troubleshooting

**Backend won't start?**
- Check if port 5000 is free: `netstat -an | findstr 5000` (Windows) or `lsof -i :5000` (Linux/Mac)
- Install dependencies: `pip install -r requirements.txt`

**Dashboard not updating?**
- Check browser console (F12) for errors
- Verify backend is running on http://localhost:5000
- Update `CONFIG.API_URL` in `frontend/js/config.js`

**ESP32 not connecting?**
- Check serial monitor for error messages
- Verify WiFi credentials
- Ensure 2.4GHz WiFi (not 5GHz)
- Check server URL is accessible from ESP32 network

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup instructions
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
- Customize zone configurations in `backend/app.py`
- Adjust thresholds in firmware and frontend config

## API Endpoints

- `GET /` - Health check
- `GET /api/zones` - Get all zones
- `GET /api/sensor-data` - Get sensor data
- `GET /api/stats` - Get statistics
- `GET /api/status` - Get system status

## Files to Customize

- `backend/app.py` - Zone configurations, server settings
- `frontend/js/config.js` - API URLs, zone names, thresholds
- `firmware/main/main.cpp` - WiFi, pins, thresholds
- `models/train_model.py` - AI model architecture, training data

Happy farming! 🌱

