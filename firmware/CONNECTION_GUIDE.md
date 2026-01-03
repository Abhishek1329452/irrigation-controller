# Quick ESP32 Connection Checklist

## Before You Start

- [ ] ESP32 board (ESP32-DevKitC or similar)
- [ ] 4x DHT22 sensors
- [ ] 4x Soil moisture sensors
- [ ] Relay modules (1 for pump + 4 for valves)
- [ ] USB cable (data cable, not charge-only)
- [ ] Backend server running (local or deployed)

## Quick Setup Steps

### 1. Hardware (10 minutes)
- [ ] Connect DHT22 sensors to GPIO 4, 5, 18, 19
- [ ] Connect soil sensors to GPIO 34, 35, 32, 33
- [ ] Connect relays to GPIO 25 (pump), 26-27, 14, 12 (valves)
- [ ] Connect all VCC to 3.3V, GND to GND
- [ ] Power relays with external 5V supply

### 2. Software (5 minutes)
- [ ] Install PlatformIO in VS Code
- [ ] Edit `firmware/main/main.cpp`:
  - WiFi SSID
  - WiFi password
  - Server URL (your backend IP/URL)
- [ ] Connect ESP32 via USB
- [ ] Build and upload firmware

### 3. Test (2 minutes)
- [ ] Open Serial Monitor (115200 baud)
- [ ] Verify "WiFi connected!"
- [ ] Check backend receives data
- [ ] View dashboard with sensor readings

## Common Issues Quick Fix

| Problem | Solution |
|---------|----------|
| WiFi fails | Check SSID/password, use 2.4GHz WiFi |
| No data received | Verify server URL, check backend is running |
| Sensors read 0 | Calibrate soil sensors, check wiring |
| Upload fails | Install USB drivers, try different cable |

See `ESP32_SETUP.md` for detailed guide.

