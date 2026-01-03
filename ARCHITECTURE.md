# System Architecture

## Overview

The Intelligent Irrigation Controller is an Edge AI system that automates water distribution in micro-farms and greenhouse environments. The system consists of three main components:

1. **ESP32 Firmware** - Edge AI inference and hardware control
2. **Backend Server** - Data collection, storage, and API
3. **Frontend Dashboard** - Real-time monitoring and visualization

## Component Details

### 1. ESP32 Firmware (Edge AI)

**Location**: `firmware/main/main.cpp`

**Responsibilities**:
- Read sensor data from 4 zones (soil moisture, temperature, humidity)
- Run TensorFlow Lite inference locally to predict water requirements
- Control pump and valves based on AI predictions
- Send sensor data to backend server via WiFi
- Operate autonomously (works even if backend is offline)

**Key Features**:
- Lightweight TensorFlow Lite model runs on ESP32
- Multi-zone monitoring and control
- Real-time decision making at the edge
- WiFi connectivity for data transmission
- Low latency irrigation control

**Technology Stack**:
- Platform: ESP32 (Arduino framework)
- AI: TensorFlow Lite for Microcontrollers
- Communication: HTTP POST requests, WiFi

### 2. Backend Server

**Location**: `backend/app.py`

**Responsibilities**:
- Receive and store sensor data from ESP32
- Provide REST API for data access
- WebSocket server for real-time updates
- Zone configuration management
- Statistics calculation and reporting

**Key Features**:
- RESTful API endpoints
- WebSocket for real-time data streaming
- In-memory data storage (can be extended to database)
- Zone configuration management
- Historical data retrieval

**Technology Stack**:
- Framework: Flask
- WebSocket: Flask-SocketIO
- API: REST endpoints
- Data Format: JSON

**API Endpoints**:
- `POST /api/sensor-data` - Receive sensor data from ESP32
- `GET /api/sensor-data` - Retrieve historical sensor data
- `GET /api/zones` - Get zone configurations
- `PUT /api/zones/<id>` - Update zone configuration
- `GET /api/status` - Get system status
- `GET /api/stats` - Get system statistics

### 3. Frontend Dashboard

**Location**: `frontend/`

**Responsibilities**:
- Display real-time sensor data
- Visualize trends and historical data
- Show system alerts and notifications
- Provide zone status overview
- Display AI predictions and water usage

**Key Features**:
- Real-time updates via WebSocket
- Interactive charts (Chart.js)
- Responsive design (mobile-friendly)
- Alert system for anomalies
- Multi-zone visualization

**Technology Stack**:
- HTML5, CSS3, JavaScript (vanilla)
- Chart.js for visualizations
- Socket.IO client for WebSocket
- Responsive CSS Grid/Flexbox

### 4. AI Model Training

**Location**: `models/`

**Responsibilities**:
- Train lightweight neural network model
- Convert model to TensorFlow Lite format
- Generate model header for ESP32 firmware

**Model Details**:
- Input: 5 features (soil moisture, temperature, humidity, zone_id, hour)
- Output: Water requirement prediction (0-100 ml)
- Architecture: 2-layer neural network (16→8→1 neurons)
- Optimization: Quantized TensorFlow Lite model
- Size: ~10-20 KB (suitable for ESP32)

**Training Process**:
1. Generate/collect training data
2. Train Keras model
3. Convert to TensorFlow Lite
4. Convert to C header file
5. Include in firmware

## Data Flow

```
┌─────────────┐
│   Sensors   │
│  (ESP32)    │
└──────┬──────┘
       │
       ├─► Read sensor values
       │
       ├─► Run TensorFlow Lite inference
       │
       ├─► Make watering decision
       │
       ├─► Control pump/valves
       │
       └─► Send data via HTTP POST
           │
           ▼
    ┌──────────────┐
    │   Backend    │
    │   Server     │
    └──────┬───────┘
           │
           ├─► Store data (in-memory/DB)
           │
           ├─► Broadcast via WebSocket
           │        │
           │        ▼
           │   ┌─────────────┐
           │   │  Frontend   │
           │   │  Dashboard  │
           │   └─────────────┘
           │
           └─► Serve REST API
                   │
                   ▼
            ┌─────────────┐
            │  Mobile/Web │
            │   Clients   │
            └─────────────┘
```

## Edge AI Workflow

1. **Sensor Reading** (every 30 seconds)
   - Read analog soil moisture sensors
   - Read DHT22 temperature/humidity sensors

2. **Preprocessing**
   - Normalize sensor values (match training normalization)
   - Prepare input tensor (5 features)

3. **AI Inference** (TensorFlow Lite)
   - Load model from flash memory
   - Run inference on ESP32 CPU
   - Get water requirement prediction

4. **Decision Making**
   - Combine AI prediction with thresholds
   - Determine if watering is needed
   - Calculate watering duration

5. **Control Execution**
   - Activate appropriate valves
   - Start pump
   - Monitor and stop after duration

6. **Data Transmission**
   - Package sensor data + predictions
   - Send to backend via HTTP POST
   - Handle network errors gracefully

## System Benefits

### Edge AI Advantages
- **Low Latency**: Decisions made locally (<100ms)
- **Offline Operation**: Works without internet connection
- **Privacy**: Sensor data processed locally
- **Reduced Bandwidth**: Only send summary data
- **Reliability**: No dependency on cloud services

### Resource Efficiency
- **Water Optimization**: AI predicts exact water needs
- **Energy Efficient**: ESP32 consumes <100mA
- **Cost Effective**: Minimal hardware requirements
- **Scalable**: Add more zones easily

## Extension Points

### Database Integration
Replace in-memory storage with:
- SQLite (lightweight, file-based)
- PostgreSQL (robust, production-ready)
- InfluxDB (time-series optimized)

### Additional Sensors
- Light sensors (LDR/photoresistor)
- pH sensors
- Nutrient level sensors
- Weather station integration

### Enhanced AI
- Time series models (LSTM) for prediction
- Reinforcement learning for optimization
- Multi-objective optimization (water + energy)
- Transfer learning from other farms

### Mobile App
- Native iOS/Android app
- Push notifications
- Remote control
- Photo documentation

### Cloud Integration
- Data backup to cloud
- Multi-farm management
- Weather API integration
- ML model updates OTA

## Security Considerations

For production deployment:
- Add authentication (JWT tokens)
- Use HTTPS/TLS encryption
- Implement rate limiting
- Add input validation
- Secure WiFi (WPA2/WPA3)
- Regular firmware updates
- Secure API keys management

## Performance Metrics

- **Inference Time**: <50ms per prediction
- **Sensor Update Rate**: 30 seconds
- **Data Transmission**: 60 seconds
- **Watering Response**: <1 second from detection
- **Power Consumption**: <5W (ESP32 + sensors)
- **Model Size**: <20KB

## Scalability

The system can be scaled:
- **Horizontal**: Add more ESP32 controllers
- **Vertical**: Add more zones per controller (up to hardware limits)
- **Distributed**: Multiple farms, centralized dashboard
- **Cloud**: Centralized data aggregation and analytics

