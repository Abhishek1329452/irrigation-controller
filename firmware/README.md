# ESP32 Firmware for Intelligent Irrigation Controller

This directory contains the firmware code for the ESP32 microcontroller that runs the Edge AI inference and controls the irrigation system.

## Hardware Requirements

- ESP32 Development Board (e.g., ESP32-DevKitC)
- 4x DHT22 Temperature/Humidity sensors
- 4x Capacitive soil moisture sensors
- 1x Relay module (5V) for pump control
- 4x Relay modules or single 4-channel relay board for valve control
- 5V power supply for relays
- Water pump
- 4x Solenoid valves

## Pin Configuration

The firmware uses the following pin assignments (modify in `main.cpp` if needed):

### Sensor Pins
- Zone 0: DHT22 on GPIO 4, Soil sensor on ADC1_CH6 (GPIO 34)
- Zone 1: DHT22 on GPIO 5, Soil sensor on ADC1_CH7 (GPIO 35)
- Zone 2: DHT22 on GPIO 18, Soil sensor on ADC1_CH4 (GPIO 32)
- Zone 3: DHT22 on GPIO 19, Soil sensor on ADC1_CH5 (GPIO 33)

### Control Pins
- Pump: GPIO 25
- Valve Zone 0: GPIO 26
- Valve Zone 1: GPIO 27
- Valve Zone 2: GPIO 14
- Valve Zone 3: GPIO 12

## Setup Instructions

### 1. Install PlatformIO

PlatformIO is the recommended IDE for this project. Install it from:
- VS Code Extension: Search for "PlatformIO IDE"
- Standalone: https://platformio.org/

### 2. Install Dependencies

The required libraries are specified in `platformio.ini` and will be installed automatically when you build the project.

### 3. Convert TensorFlow Lite Model

Before building the firmware, you need to convert your TensorFlow Lite model to a C array:

```bash
# Install xxd (usually pre-installed on Linux/Mac)
# On Windows, use WSL or install Git Bash

# Convert .tflite to C header
xxd -i irrigation_model.tflite firmware/main/irrigation_model.h
```

Or use the Python script:
```python
import numpy as np

# Read the .tflite file
with open('models/irrigation_model.tflite', 'rb') as f:
    model_data = f.read()

# Convert to C array
array_str = 'const unsigned char irrigation_model_tflite[] = {\n'
for i, byte in enumerate(model_data):
    if i % 12 == 0:
        array_str += '  '
    array_str += f'0x{byte:02x},'
    if (i + 1) % 12 == 0:
        array_str += '\n'
    else:
        array_str += ' '
array_str += '\n};\n'
array_str += f'const unsigned int irrigation_model_tflite_len = {len(model_data)};\n'

with open('firmware/main/irrigation_model.h', 'w') as f:
    f.write(array_str)
```

### 4. Configure WiFi

Edit `firmware/main/main.cpp` and update:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server_url = "http://YOUR_SERVER_IP:5000/api/sensor-data";
```

### 5. Build and Upload

```bash
# Build the project
pio run

# Upload to ESP32
pio run --target upload

# Monitor serial output
pio device monitor
```

## TensorFlow Lite for Microcontrollers

The firmware uses TensorFlow Lite for Microcontrollers, which is included in the Arduino framework. The model inference runs directly on the ESP32, enabling true Edge AI.

### Model Input Format

The model expects 5 features:
1. Soil moisture (0-100%)
2. Temperature (°C)
3. Humidity (%)
4. Zone ID (0-3)
5. Hour of day (0-23)

### Model Output

The model outputs a single value representing the predicted water requirement (0-100 ml).

## Calibration

### Soil Moisture Sensors

Calibrate your soil moisture sensors by:
1. Reading sensor value in dry soil (air)
2. Reading sensor value in wet soil (fully saturated)
3. Adjust the `readSoilMoisture()` function mapping accordingly

Example:
```cpp
float readSoilMoisture(int pin) {
    int raw = analogRead(pin);
    // Calibrate these values based on your sensor
    float percentage = map(raw, DRY_VALUE, WET_VALUE, 0, 100);
    return constrain(percentage, 0, 100);
}
```

## Troubleshooting

### WiFi Connection Issues
- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check signal strength

### Sensor Reading Errors
- Verify wiring connections
- Check sensor power supply (DHT22 needs 3.3V or 5V)
- Add pull-up resistors if needed (10kΩ for DHT22)

### Model Inference Errors
- Verify model file is correctly converted
- Check tensor arena size (increase `kTensorArenaSize` if needed)
- Ensure input normalization matches training

### Pump/Valve Not Working
- Verify relay connections
- Check power supply to relays
- Test relays independently
- Ensure GPIO pins are correctly configured

## Notes

- The firmware sends data every 60 seconds by default
- Sensors are read every 30 seconds
- Watering duration is set to 5 seconds (adjust based on your system)
- The system uses threshold-based watering (moisture < 40% AND prediction > 20ml)

## License

MIT License

