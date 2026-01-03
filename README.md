# Intelligent Edge AI Irrigation Controller

An intelligent irrigation control system that uses Edge AI to automate water distribution in micro-farms and greenhouse environments. The system monitors soil moisture, temperature, and humidity across multiple zones, processes data locally on a microcontroller using lightweight AI models, and optimizes pump and valve operation to minimize water wastage while maintaining plant health.

## Features

- 🌱 **Multi-Zone Monitoring**: Monitor soil moisture, temperature, and humidity across multiple irrigation zones
- 🤖 **Edge AI Processing**: Lightweight TensorFlow Lite models run directly on ESP32 microcontroller
- 💧 **Smart Watering**: AI-driven predictions optimize pump and valve operation in real-time
- 📊 **Real-Time Dashboard**: Live monitoring with trend visualization and system alerts
- 📱 **Mobile Responsive**: Accessible via web interface on any device
- 🔄 **Resource Efficient**: Minimizes water waste while maintaining optimal plant health

## System Architecture

```
┌─────────────────┐
│  Sensors        │
│  (Soil/Temp/    │
│   Humidity)     │
└────────┬────────┘
         │
┌────────▼────────┐      HTTP/WebSocket      ┌──────────────┐
│  ESP32          │◄─────────────────────────►│  Backend     │
│  (Edge AI)      │                           │  Server      │
│  - Inference    │                           │  (Flask)     │
│  - Control      │                           └──────┬───────┘
│  - Pump/Valves  │                                  │
└─────────────────┘                                  │
                                                     │
                                            ┌────────▼────────┐
                                            │  Frontend       │
                                            │  Dashboard      │
                                            │  (React/HTML)   │
                                            └─────────────────┘
```

## Project Structure

```
agriculture/
├── firmware/              # ESP32 microcontroller code
│   ├── main/              # Main firmware source
│   ├── components/        # Reusable components
│   └── models/            # TensorFlow Lite models
├── backend/               # Python backend server
│   ├── app.py             # Flask application
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   └── ai/                # AI inference utilities
├── frontend/              # Web dashboard
│   ├── index.html         # Main dashboard
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript
├── models/                # AI model training scripts
│   ├── train_model.py     # Model training
│   └── convert_to_tflite.py
└── docs/                  # Documentation
```

## Hardware Requirements

- ESP32 microcontroller (or compatible)
- Soil moisture sensors (capacitive type recommended)
- DHT22/DHT11 temperature and humidity sensors
- Relay modules for pump and valve control
- Power supply for relays
- Water pump and solenoid valves

## Software Requirements

- Python 3.8+
- Node.js (for frontend development, optional)
- Arduino IDE or PlatformIO (for firmware)
- TensorFlow Lite

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

The frontend is a static HTML/CSS/JS application. Simply serve the `frontend/` directory using any web server or open `index.html` directly.

### Firmware Setup

1. Install PlatformIO or Arduino IDE
2. Install ESP32 board support
3. Install required libraries (see firmware documentation)
4. Upload firmware to ESP32
5. Configure WiFi credentials in firmware

## Usage

1. **Training the AI Model** (optional, pre-trained model included):
   ```bash
   cd models
   python train_model.py
   python convert_to_tflite.py
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   python app.py
   ```
   Server runs on `http://localhost:5000`

3. **Access the Dashboard**:
   Open `frontend/index.html` in a web browser or serve via the backend

4. **Configure Zones**:
   Use the dashboard to configure irrigation zones and set thresholds

## Configuration

- WiFi credentials: Configure in firmware code
- API endpoint: Configure in firmware and frontend
- Sensor calibration: Adjust in firmware for your specific sensors
- AI model parameters: Adjust in model training script

## Documentation

- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** ⭐ **START HERE** - Complete step-by-step guide (Deployment + Hardware)
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes (local testing)
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[ESP32_SETUP.md](ESP32_SETUP.md)** - Complete ESP32 hardware connection guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Free deployment guide (Render, Netlify, etc.)
- **[DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md)** - 5-minute deployment guide
- **[firmware/README.md](firmware/README.md)** - Firmware setup and configuration

## License

MIT License - See LICENSE file for details

## Contributors

Developed as a demonstration of Edge AI for precision agriculture.

