# ESP32 Hardware Connection Guide

Complete guide to connect your ESP32 to the irrigation controller system and start receiving sensor data.

## Hardware Requirements

### Required Components
- **ESP32 Development Board** (ESP32-DevKitC, NodeMCU-32S, or similar)
- **4x DHT22 Temperature/Humidity Sensors** (or DHT11 - less accurate)
- **4x Capacitive Soil Moisture Sensors** (analog output)
- **1x Relay Module** (5V, for pump control)
- **1x 4-Channel Relay Module** (for 4 valves) OR 4x Single Relay Modules
- **5V Power Supply** (for relays, minimum 2A)
- **Water Pump** (12V DC or AC, depending on your setup)
- **4x Solenoid Valves** (12V DC recommended)
- **Breadboard and Jumper Wires**
- **Resistors** (10kΩ pull-up for DHT22, if needed)

### Optional but Recommended
- **Level Shifter** (3.3V to 5V, if using 5V sensors)
- **Diode** (1N4007) across relay coils for protection
- **Capacitor** (100µF) for power supply smoothing

## Hardware Connections

### Pin Mapping

```
ESP32 GPIO → Component
─────────────────────────────────────────
GPIO 4    → DHT22 Zone 0 Data
GPIO 5    → DHT22 Zone 1 Data
GPIO 18   → DHT22 Zone 2 Data
GPIO 19   → DHT22 Zone 3 Data

GPIO 34   → Soil Sensor Zone 0 (ADC1_CH6)
GPIO 35   → Soil Sensor Zone 1 (ADC1_CH7)
GPIO 32   → Soil Sensor Zone 2 (ADC1_CH4)
GPIO 33   → Soil Sensor Zone 3 (ADC1_CH5)

GPIO 25   → Pump Relay IN
GPIO 26   → Valve 0 Relay IN
GPIO 27   → Valve 1 Relay IN
GPIO 14   → Valve 2 Relay IN
GPIO 12   → Valve 3 Relay IN

3.3V      → DHT22 VCC (all zones)
GND       → Common Ground (all components)
```

### Wiring Diagram

```
┌─────────────┐
│   ESP32     │
│             │
│  GPIO 4─────┼───► DHT22 Zone 0 (Data)
│  GPIO 5─────┼───► DHT22 Zone 1 (Data)
│  GPIO 18────┼───► DHT22 Zone 2 (Data)
│  GPIO 19────┼───► DHT22 Zone 3 (Data)
│             │
│  GPIO 34────┼───► Soil Sensor 0 (Analog)
│  GPIO 35────┼───► Soil Sensor 1 (Analog)
│  GPIO 32────┼───► Soil Sensor 2 (Analog)
│  GPIO 33────┼───► Soil Sensor 3 (Analog)
│             │
│  GPIO 25────┼───► Pump Relay IN
│  GPIO 26────┼───► Valve Relay 0 IN
│  GPIO 27────┼───► Valve Relay 1 IN
│  GPIO 14────┼───► Valve Relay 2 IN
│  GPIO 12────┼───► Valve Relay 3 IN
│             │
│  3.3V ──────┼───► DHT22 VCC (all)
│  GND ───────┼───► Common Ground
└─────────────┘
```

### Relay Connections

**5V Relay Module:**
```
ESP32 GPIO → Relay Module IN Pin
Relay Module COM → Pump/Valve Positive
Relay Module NO → Pump/Valve (normally open)
Relay Module GND → ESP32 GND
Relay Module VCC → 5V Power Supply
```

**Pump/Valve Connection:**
```
12V Power Supply + → Pump/Valve +
Relay NO → Pump/Valve -
12V Power Supply - → Common Ground
```

## Software Setup

### Step 1: Install PlatformIO (Recommended)

1. **Install VS Code**: https://code.visualstudio.com/
2. **Install PlatformIO Extension**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "PlatformIO IDE"
   - Click Install

### Step 2: Configure WiFi and Server

1. **Edit firmware configuration**:
   Open `firmware/main/main.cpp` and update:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
const char* server_url = "http://YOUR_SERVER_IP:5000/api/sensor-data";
```

**For Local Testing:**
- `server_url`: `"http://192.168.1.100:5000/api/sensor-data"` (your computer's local IP)
- Find your IP: Windows: `ipconfig`, Linux/Mac: `ifconfig`

**For Deployed Server:**
- `server_url`: `"https://your-app.onrender.com/api/sensor-data"` (your deployed backend URL)

### Step 3: Train and Convert AI Model (Optional)

If you want to use the Edge AI model:

```bash
cd models
python train_model.py
python convert_to_tflite.py
python convert_model_to_header.py
```

This creates `firmware/main/irrigation_model.h` (if the model file exists).

**Note**: The firmware includes a placeholder model. For full Edge AI functionality, you need to generate the actual model file.

### Step 4: Install Dependencies

PlatformIO will automatically install libraries specified in `firmware/platformio.ini`:
- DHT sensor library
- ArduinoJson
- TensorFlow Lite (if using AI model)

### Step 5: Build and Upload Firmware

1. **Connect ESP32** to your computer via USB
2. **Open PlatformIO**:
   - Click PlatformIO icon in VS Code sidebar
   - Open `firmware` folder
3. **Build**:
   - Click "Build" (✓ icon) or press Ctrl+Alt+B
4. **Upload**:
   - Click "Upload" (→ icon) or press Ctrl+Alt+U
5. **Monitor** (optional):
   - Click "Serial Monitor" or press Ctrl+Alt+S
   - Set baud rate to 115200

## Testing the Connection

### Step 1: Start Backend Server

**Local Testing:**
```bash
cd backend
python app.py
```

Server should start on `http://localhost:5000`

### Step 2: Check Serial Monitor

After uploading firmware, open Serial Monitor (115200 baud). You should see:

```
Intelligent Irrigation Controller Starting...
Loading TensorFlow Lite model...
WiFi connected!
IP address: 192.168.1.XXX
System ready!
Zone 0: Moisture=45.2%, Temp=24.5°C, Humidity=60.1%, Prediction=32.5 ml, Need Water=0
...
```

### Step 3: Verify Data Reception

1. **Check Backend Logs**:
   You should see:
   ```
   Data sent successfully, response code: 200
   ```

2. **Check Dashboard**:
   - Open `frontend/index.html` in browser
   - Or use your deployed frontend URL
   - Sensor data should appear in real-time

3. **Test API Endpoint**:
   ```bash
   curl http://localhost:5000/api/sensor-data
   ```
   Should return JSON with sensor data

## Sensor Calibration

### Soil Moisture Sensors

The capacitive soil moisture sensors need calibration:

1. **Test in Air (Dry)**:
   - Place sensor in air
   - Read value from Serial Monitor
   - Note the value (e.g., 3000)

2. **Test in Water (Wet)**:
   - Place sensor in water
   - Read value from Serial Monitor
   - Note the value (e.g., 1500)

3. **Update Firmware**:

   In `firmware/main/main.cpp`, update `readSoilMoisture()`:

```cpp
float readSoilMoisture(int pin) {
    int raw = analogRead(pin);
    // Calibrate these values based on your sensor
    int DRY_VALUE = 3000;  // Value in air (dry)
    int WET_VALUE = 1500;  // Value in water (wet)
    
    float percentage = map(raw, DRY_VALUE, WET_VALUE, 0, 100);
    return constrain(percentage, 0, 100);
}
```

### DHT22 Sensors

DHT22 sensors are digital and don't need calibration, but:
- Ensure 3.3V power (ESP32 provides this)
- Use 10kΩ pull-up resistor if readings are unstable
- Allow 2 seconds between readings (firmware already does this)

## Troubleshooting

### ESP32 Won't Connect to WiFi

**Symptoms**: Serial Monitor shows "WiFi connection failed!"

**Solutions**:
- ✅ Verify SSID and password are correct (case-sensitive)
- ✅ Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- ✅ Check WiFi signal strength (move ESP32 closer to router)
- ✅ Verify WiFi password doesn't contain special characters
- ✅ Check if router has MAC filtering (disable or add ESP32 MAC)

### Can't Upload Firmware

**Symptoms**: Upload fails or ESP32 not detected

**Solutions**:
- ✅ Install USB drivers (CP2102 or CH340 drivers)
- ✅ Try different USB cable (data cable, not charge-only)
- ✅ Press BOOT button on ESP32 during upload
- ✅ Select correct COM port in PlatformIO
- ✅ Try different USB port

### Sensor Readings Are Wrong

**Soil Moisture Always 0 or 100**:
- ✅ Calibrate sensor (see Sensor Calibration section)
- ✅ Check wiring connections
- ✅ Verify sensor is getting power
- ✅ Test with multimeter

**DHT22 Shows NaN (Not a Number)**:
- ✅ Check wiring (Data pin connection)
- ✅ Add 10kΩ pull-up resistor between Data and 3.3V
- ✅ Verify sensor is getting 3.3V (not 5V)
- ✅ Allow more time between readings
- ✅ Replace sensor if faulty

### Backend Not Receiving Data

**Symptoms**: No data in dashboard, API returns empty

**Solutions**:
- ✅ Verify backend is running (`python app.py`)
- ✅ Check server URL in firmware (correct IP/URL)
- ✅ Ensure ESP32 and computer are on same network (for local testing)
- ✅ Check firewall isn't blocking port 5000
- ✅ Verify HTTPS for deployed servers (not HTTP)
- ✅ Check Serial Monitor for error messages
- ✅ Test backend with: `curl http://YOUR_IP:5000/` (should return JSON)

### Relay Not Working

**Symptoms**: Pump/valves don't activate

**Solutions**:
- ✅ Verify relay module is getting 5V power
- ✅ Check GPIO pins are connected correctly
- ✅ Test relay with multimeter (check continuity)
- ✅ Verify pump/valves work when directly connected to power
- ✅ Check relay module LEDs (should light when GPIO goes HIGH)
- ✅ Ensure common ground between ESP32 and relay power supply

### High Power Consumption

**Symptoms**: ESP32 resets or unstable behavior

**Solutions**:
- ✅ Use external 5V/2A power supply for relays (don't power from ESP32 USB)
- ✅ Add decoupling capacitors (100µF) near power inputs
- ✅ Use separate power supply for pump/valves
- ✅ Add diode across relay coils (1N4007) for back-EMF protection

## Advanced Configuration

### Change Sensor Reading Interval

In `firmware/main/main.cpp`:

```cpp
const unsigned long SENSOR_INTERVAL = 30000;  // 30 seconds (change as needed)
```

### Change Data Send Interval

```cpp
const unsigned long DATA_SEND_INTERVAL = 60000;  // 60 seconds (change as needed)
```

### Adjust Watering Thresholds

```cpp
zones[i].needs_watering = (zones[i].soil_moisture < 40.0) && 
                          (zones[i].water_prediction > 20.0);
```

Change `40.0` (moisture threshold) and `20.0` (prediction threshold) as needed.

### Change Watering Duration

```cpp
delay(5000);  // Water for 5 seconds (adjust based on your system)
```

## Next Steps

1. ✅ Verify all sensors are working
2. ✅ Calibrate soil moisture sensors
3. ✅ Test relay activation (pump and valves)
4. ✅ Monitor data in dashboard
5. ✅ Adjust thresholds based on your plants' needs
6. ✅ Set up automated watering schedule (if needed)

## Safety Notes

⚠️ **Important Safety Considerations**:

1. **Electrical Safety**:
   - Always disconnect power before wiring
   - Use proper wire gauges for pump/valve current
   - Install fuses in power lines
   - Use waterproof enclosures for outdoor installation

2. **Water Safety**:
   - Install backflow preventer if connecting to main water supply
   - Use pressure relief valves
   - Install water leak sensors
   - Test system before leaving unattended

3. **Relay Protection**:
   - Use diodes across relay coils
   - Don't exceed relay current ratings
   - Use appropriate relay for AC vs DC loads

4. **ESP32 Protection**:
   - Use level shifters if connecting 5V sensors
   - Don't exceed GPIO current limits (12mA per pin)
   - Use external power for relays (not USB power)

## Support

For issues:
1. Check Serial Monitor for error messages
2. Verify all connections
3. Test components individually
4. Review troubleshooting section above
5. Check firmware code comments

Happy farming! 🌱

