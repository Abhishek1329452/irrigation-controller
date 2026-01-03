# Complete Setup Guide - Deployment + Hardware

Complete step-by-step guide to deploy your irrigation controller system for FREE and connect ESP32 hardware.

---

## 📋 Prerequisites

### Software
- ✅ Python 3.8+ installed
- ✅ GitHub account (free)
- ✅ VS Code installed
- ✅ PlatformIO extension for VS Code

### Hardware
- ✅ ESP32 Development Board
- ✅ 4x DHT22 Temperature/Humidity Sensors
- ✅ 4x Soil Moisture Sensors (Capacitive)
- ✅ 5x Relay Modules (1 for pump + 4 for valves)
- ✅ USB Cable (data cable, not charge-only)
- ✅ Jumper Wires
- ✅ 5V Power Supply (for relays)

---

## 🚀 PART 1: FREE DEPLOYMENT (15 minutes)

### Step 1: Prepare Your Code

1. **Open terminal in your project folder**:
   ```bash
   cd C:\Users\xanas\OneDrive\Desktop\agriculture
   ```

2. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Create GitHub Repository**:
   - Go to https://github.com
   - Click "New repository"
   - Name: `irrigation-controller`
   - Click "Create repository"

4. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/irrigation-controller.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

### Step 2: Deploy Backend on Render (FREE)

1. **Sign up on Render**:
   - Go to https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub (easiest)

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your `irrigation-controller` repository
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `irrigation-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python app.py`

4. **Add Environment Variable** (optional):
   - Click "Advanced" → "Add Environment Variable"
   - Key: `PORT`, Value: `5000`
   - (Render sets this automatically, but adding it is safe)

5. **Create Service**:
   - Scroll down and click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - ✅ **Copy your service URL**: `https://irrigation-backend-XXXX.onrender.com`

### Step 3: Update Frontend Configuration

1. **Edit `frontend/js/config.js`**:
   ```javascript
   const CONFIG = {
       // Replace with your Render URL
       API_URL: 'https://irrigation-backend-XXXX.onrender.com',
       WS_URL: 'https://irrigation-backend-XXXX.onrender.com',
       // ... rest stays the same
   };
   ```

2. **Commit and Push**:
   ```bash
   git add frontend/js/config.js
   git commit -m "Update backend URL for deployment"
   git push
   ```

### Step 4: Deploy Frontend on Netlify (FREE)

1. **Sign up on Netlify**:
   - Go to https://netlify.com
   - Click "Sign up" → "GitHub"
   - Authorize Netlify

2. **Import Site**:
   - Click "Add new site" → "Import an existing project"
   - Click "Deploy with GitHub"
   - Select your `irrigation-controller` repository

3. **Configure Build**:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty - it's a static site)
   - **Publish directory**: `frontend`

4. **Deploy**:
   - Click "Deploy site"
   - Wait 1-2 minutes
   - ✅ **Copy your site URL**: `https://XXXX-XXXX-XXXX.netlify.app`

5. **Optional - Custom Domain**:
   - Go to Site settings → Domain management
   - Change site name to something memorable

### Step 5: Verify Deployment

1. **Test Backend**:
   - Visit: `https://your-backend-url.onrender.com`
   - Should see: `{"status":"online","service":"Intelligent Irrigation Controller API"...}`

2. **Test Frontend**:
   - Visit: `https://your-frontend-url.netlify.app`
   - Dashboard should load (may show "No Data" - that's normal)

✅ **Deployment Complete!** Your backend and frontend are now live.

---

## 🔧 PART 2: HARDWARE SETUP (20 minutes)

### Step 6: Hardware Connections

#### A. Connect DHT22 Sensors (Temperature/Humidity)

**For each of the 4 zones:**

```
DHT22 Sensor    →    ESP32
─────────────────────────────
VCC (Pin 1)     →    3.3V
Data (Pin 2)    →    GPIO (see below)
GND (Pin 4)     →    GND
NC (Pin 3)      →    (Not connected)
```

**GPIO Pin Mapping:**
- Zone 0: Data → GPIO 4
- Zone 1: Data → GPIO 5
- Zone 2: Data → GPIO 18
- Zone 3: Data → GPIO 19

**Optional**: Add 10kΩ pull-up resistor between Data and 3.3V if readings are unstable.

#### B. Connect Soil Moisture Sensors

**For each of the 4 zones:**

```
Soil Sensor     →    ESP32
─────────────────────────────
VCC             →    3.3V (or 5V if sensor requires)
GND             →    GND
A0 (Analog)     →    GPIO (see below)
```

**GPIO Pin Mapping (Analog Inputs):**
- Zone 0: A0 → GPIO 34 (ADC1_CH6)
- Zone 1: A0 → GPIO 35 (ADC1_CH7)
- Zone 2: A0 → GPIO 32 (ADC1_CH4)
- Zone 3: A0 → GPIO 33 (ADC1_CH5)

#### C. Connect Relays

**Pump Relay:**
```
ESP32 GPIO 25   →    Relay Module IN
Relay COM       →    Pump Positive (+)
Relay NO        →    Pump (Normally Open)
Relay GND       →    ESP32 GND
Relay VCC       →    5V Power Supply (+)
```

**Valve Relays (4 zones):**
```
ESP32 GPIO 26   →    Relay 0 IN (Zone 0 Valve)
ESP32 GPIO 27   →    Relay 1 IN (Zone 1 Valve)
ESP32 GPIO 14   →    Relay 2 IN (Zone 2 Valve)
ESP32 GPIO 12   →    Relay 3 IN (Zone 3 Valve)
```

**Each Valve Relay:**
```
Relay COM       →    Valve Positive (+)
Relay NO        →    Valve (Normally Open)
Relay GND       →    Common GND
Relay VCC       →    5V Power Supply (+)
```

**⚠️ Important:**
- Use external 5V/2A power supply for relays (don't power from ESP32 USB)
- Connect all grounds together (common ground)
- Use appropriate wire gauge for pump/valve current

### Step 7: Install PlatformIO

1. **Install VS Code** (if not installed):
   - Download from https://code.visualstudio.com
   - Install

2. **Install PlatformIO Extension**:
   - Open VS Code
   - Press `Ctrl+Shift+X` (Extensions)
   - Search for "PlatformIO IDE"
   - Click "Install"
   - Wait for installation (may take a few minutes)

3. **Verify Installation**:
   - Look for PlatformIO icon in VS Code sidebar (alien head icon)
   - Click it to open PlatformIO

### Step 8: Configure ESP32 Firmware

1. **Open Project in VS Code**:
   - File → Open Folder
   - Select your `agriculture` folder

2. **Edit Firmware Configuration**:
   - Open: `firmware/main/main.cpp`
   - Find these lines (around line 28-31):
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* server_url = "http://YOUR_SERVER_IP:5000/api/sensor-data";
   ```

3. **Update Configuration**:
   ```cpp
   const char* ssid = "YourWiFiName";                    // Your WiFi network name
   const char* password = "YourWiFiPassword";            // Your WiFi password
   const char* server_url = "https://irrigation-backend-XXXX.onrender.com/api/sensor-data";
   ```
   
   **Important:**
   - Use your Render backend URL (from Step 2)
   - Must use `https://` (not `http://`)
   - WiFi must be 2.4GHz (ESP32 doesn't support 5GHz)

4. **Save the file** (`Ctrl+S`)

### Step 9: Upload Firmware to ESP32

1. **Connect ESP32**:
   - Connect ESP32 to computer via USB cable
   - Wait for Windows to detect device

2. **Install USB Driver** (if needed):
   - If ESP32 not detected, install driver:
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - CH340: Search "CH340 driver Windows" and download

3. **Open PlatformIO**:
   - Click PlatformIO icon in VS Code sidebar
   - Open `firmware` folder (if not already open)

4. **Build Firmware**:
   - Click "Build" button (✓ checkmark icon) in PlatformIO toolbar
   - OR press `Ctrl+Alt+B`
   - Wait for build to complete (should see "SUCCESS")

5. **Upload to ESP32**:
   - Click "Upload" button (→ arrow icon) in PlatformIO toolbar
   - OR press `Ctrl+Alt+U`
   - Wait for upload (should see "SUCCESS")

6. **Open Serial Monitor**:
   - Click "Serial Monitor" button (plug icon) in PlatformIO toolbar
   - OR press `Ctrl+Alt+S`
   - Set baud rate to **115200**

### Step 10: Verify Hardware Connection

**What you should see in Serial Monitor:**

```
Intelligent Irrigation Controller Starting...
Loading TensorFlow Lite model...
WiFi connected!
IP address: 192.168.1.XXX
System ready!
Zone 0: Moisture=45.2%, Temp=24.5°C, Humidity=60.1%, Prediction=32.5 ml, Need Water=0
Zone 1: Moisture=38.1%, Temp=25.2°C, Humidity=58.3%, Prediction=45.2 ml, Need Water=1
...
Data sent successfully, response code: 200
```

**If you see errors:**
- See Troubleshooting section below

---

## ✅ PART 3: TESTING & VERIFICATION (5 minutes)

### Step 11: Verify Data Flow

1. **Check Backend Logs** (Render):
   - Go to Render dashboard
   - Click on your service
   - Click "Logs" tab
   - Should see: `Data sent successfully, response code: 200`

2. **Check Frontend Dashboard**:
   - Open: `https://your-frontend-url.netlify.app`
   - Dashboard should show:
     - ✅ System Status: Online
     - ✅ Zone cards with sensor readings
     - ✅ Charts (may be empty initially)
     - ✅ Real-time updates every 30-60 seconds

3. **Test API Directly**:
   - Visit: `https://your-backend-url.onrender.com/api/sensor-data`
   - Should see JSON with sensor data

### Step 12: Calibrate Sensors (Optional but Recommended)

1. **Soil Moisture Calibration**:
   - Test sensor in air (dry) → note value in Serial Monitor
   - Test sensor in water (wet) → note value in Serial Monitor
   - Edit `firmware/main/main.cpp` → `readSoilMoisture()` function
   - Update `DRY_VALUE` and `WET_VALUE`
   - Re-upload firmware

2. **DHT22 Sensors**:
   - Usually don't need calibration
   - If readings are NaN, check wiring and add pull-up resistor

---

## 🎯 SUMMARY CHECKLIST

### Deployment ✅
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend URL copied
- [ ] Frontend config updated with backend URL
- [ ] Frontend deployed on Netlify
- [ ] Frontend URL saved

### Hardware ✅
- [ ] All sensors connected
- [ ] All relays connected
- [ ] PlatformIO installed
- [ ] Firmware configured (WiFi + Server URL)
- [ ] Firmware uploaded to ESP32
- [ ] Serial Monitor shows "WiFi connected!"

### Testing ✅
- [ ] Backend responds at URL
- [ ] Frontend dashboard loads
- [ ] Sensor data appears in dashboard
- [ ] Real-time updates working
- [ ] Charts displaying data

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Problem**: Backend URL shows error or timeout
- **Solution**: 
  - Check Render logs for errors
  - Free tier services sleep after 15 min (first request takes ~30 sec)
  - Wait 30 seconds and try again

**Problem**: Frontend can't connect to backend
- **Solution**:
  - Verify backend URL in `frontend/js/config.js`
  - Use `https://` not `http://`
  - Check browser console (F12) for CORS errors

### Hardware Issues

**Problem**: ESP32 won't connect to WiFi
- **Solution**:
  - Verify SSID and password (case-sensitive)
  - Use 2.4GHz WiFi (not 5GHz)
  - Move ESP32 closer to router
  - Check Serial Monitor for error messages

**Problem**: No data received by backend
- **Solution**:
  - Verify server URL in firmware (use Render URL)
  - Check Serial Monitor for connection errors
  - Ensure backend is running (visit URL in browser)
  - Check firewall/network settings

**Problem**: Sensors read 0 or incorrect values
- **Solution**:
  - Calibrate soil moisture sensors (see Step 12)
  - Check wiring connections
  - Verify sensors are getting power (3.3V or 5V)
  - Test sensors individually

**Problem**: Can't upload firmware
- **Solution**:
  - Install USB drivers (CP2102 or CH340)
  - Try different USB cable (must be data cable)
  - Try different USB port
  - Press BOOT button on ESP32 during upload
  - Select correct COM port in PlatformIO

---

## 📊 FINAL RESULT

Once everything is set up, you should have:

1. ✅ **Live Backend**: Receiving sensor data 24/7 (free on Render)
2. ✅ **Live Dashboard**: Accessible from anywhere (free on Netlify)
3. ✅ **ESP32 Hardware**: Sending data automatically every 60 seconds
4. ✅ **Real-time Monitoring**: Dashboard updates automatically
5. ✅ **Historical Data**: Charts showing trends over time
6. ✅ **Automated Irrigation**: ESP32 controls pump/valves based on AI predictions

**Total Cost: $0/month** 🎉

---

## 🔄 NEXT STEPS

1. **Monitor for 24 hours** to ensure stability
2. **Calibrate sensors** based on your specific hardware
3. **Adjust thresholds** in firmware for your plants
4. **Set up alerts** (if needed, can be added to backend)
5. **Scale up**: Add more zones or sensors as needed

---

## 📞 NEED HELP?

1. Check `ESP32_SETUP.md` for detailed hardware guide
2. Check `DEPLOYMENT.md` for deployment details
3. Review Serial Monitor output for errors
4. Check Render/Netlify logs
5. Verify all connections and configurations

**You're all set! Your intelligent irrigation controller is now live and running! 🌱**

