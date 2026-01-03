// Main dashboard logic
let socket;
let currentData = {};
let alerts = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    initializeZones();
    loadHistoricalData();
    startPeriodicUpdates();
});

// Initialize WebSocket connection
function initializeWebSocket() {
    socket = io(CONFIG.WS_URL);
    
    socket.on('connect', () => {
        console.log('Connected to server');
        updateStatus('online', 'Connected');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateStatus('offline', 'Disconnected');
    });
    
    socket.on('sensor_update', (data) => {
        handleSensorUpdate(data);
    });
    
    socket.on('zone_config_update', (data) => {
        console.log('Zone config updated:', data);
        updateZoneConfig(data.zone_id, data.config);
    });
}

// Update system status indicator
function updateStatus(status, text) {
    const dot = document.getElementById('statusDot');
    const textEl = document.getElementById('statusText');
    
    dot.className = 'status-dot ' + status;
    textEl.textContent = text;
}

// Handle incoming sensor data
function handleSensorUpdate(data) {
    currentData = data.data;
    
    // Update zone displays
    Object.keys(currentData).forEach(zoneId => {
        updateZoneDisplay(parseInt(zoneId), currentData[zoneId]);
    });
    
    // Update system stats
    updateSystemStats(data.status);
    
    // Check for alerts
    checkAlerts(data.data);
    
    // Update charts
    updateCharts(data.data);
}

// Initialize zone cards
function initializeZones() {
    const container = document.getElementById('zonesContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        const zoneCard = createZoneCard(i);
        container.appendChild(zoneCard);
    }
}

// Create a zone card element
function createZoneCard(zoneId) {
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.id = `zone-${zoneId}`;
    card.innerHTML = `
        <div class="zone-header">
            <div class="zone-name">${CONFIG.ZONE_NAMES[zoneId] || `Zone ${zoneId + 1}`}</div>
            <div class="zone-status inactive" id="zone-status-${zoneId}">Inactive</div>
        </div>
        <div class="sensor-data">
            <div class="sensor-item">
                <div class="sensor-label">Soil Moisture</div>
                <div class="sensor-value" id="moisture-${zoneId}">--</div>
                <div class="moisture-bar">
                    <div class="moisture-fill" id="moisture-bar-${zoneId}" style="width: 0%"></div>
                </div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Temperature</div>
                <div class="sensor-value" id="temp-${zoneId}">--</div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Humidity</div>
                <div class="sensor-value" id="humidity-${zoneId}">--</div>
            </div>
            <div class="sensor-item">
                <div class="sensor-label">Water Applied</div>
                <div class="sensor-value" id="water-${zoneId}">0 ml</div>
            </div>
        </div>
        <div class="ai-prediction">
            <div class="ai-prediction-label">🤖 AI Water Prediction</div>
            <div class="ai-prediction-value" id="prediction-${zoneId}">-- ml</div>
        </div>
    `;
    return card;
}

// Update zone display with new data
function updateZoneDisplay(zoneId, data) {
    // Update sensor values
    document.getElementById(`moisture-${zoneId}`).textContent = 
        data.soil_moisture !== undefined ? `${data.soil_moisture.toFixed(1)}%` : '--';
    document.getElementById(`temp-${zoneId}`).textContent = 
        data.temperature !== undefined ? `${data.temperature.toFixed(1)}°C` : '--';
    document.getElementById(`humidity-${zoneId}`).textContent = 
        data.humidity !== undefined ? `${data.humidity.toFixed(1)}%` : '--';
    document.getElementById(`water-${zoneId}`).textContent = 
        data.water_applied !== undefined ? `${data.water_applied.toFixed(1)} ml` : '0 ml';
    document.getElementById(`prediction-${zoneId}`).textContent = 
        data.water_prediction !== undefined ? `${data.water_prediction.toFixed(1)} ml` : '-- ml';
    
    // Update moisture bar
    const moistureBar = document.getElementById(`moisture-bar-${zoneId}`);
    if (data.soil_moisture !== undefined) {
        moistureBar.style.width = `${data.soil_moisture}%`;
    }
    
    // Update zone status
    const statusEl = document.getElementById(`zone-status-${zoneId}`);
    if (data.soil_moisture !== undefined) {
        if (data.soil_moisture < CONFIG.MOISTURE_LOW) {
            statusEl.textContent = 'Needs Water';
            statusEl.className = 'zone-status active';
        } else {
            statusEl.textContent = 'Optimal';
            statusEl.className = 'zone-status inactive';
        }
    }
}

// Update system statistics
function updateSystemStats(status) {
    document.getElementById('systemStatus').textContent = status.online ? 'Online' : 'Offline';
    document.getElementById('activeZones').textContent = status.active_zones ? status.active_zones.length : 0;
    document.getElementById('pumpStatus').textContent = status.pump_running ? 'Running' : 'Idle';
}

// Check for alerts and add them to the alerts list
function checkAlerts(data) {
    Object.keys(data).forEach(zoneId => {
        const zoneData = data[zoneId];
        const zoneName = CONFIG.ZONE_NAMES[zoneId] || `Zone ${parseInt(zoneId) + 1}`;
        
        // Check moisture
        if (zoneData.soil_moisture < CONFIG.MOISTURE_LOW) {
            addAlert('warning', `Low soil moisture in ${zoneName}: ${zoneData.soil_moisture.toFixed(1)}%`);
        }
        
        // Check temperature
        if (zoneData.temperature > CONFIG.TEMP_HIGH) {
            addAlert('warning', `High temperature in ${zoneName}: ${zoneData.temperature.toFixed(1)}°C`);
        } else if (zoneData.temperature < CONFIG.TEMP_LOW) {
            addAlert('info', `Low temperature in ${zoneName}: ${zoneData.temperature.toFixed(1)}°C`);
        }
        
        // Check humidity
        if (zoneData.humidity < CONFIG.HUMIDITY_LOW) {
            addAlert('info', `Low humidity in ${zoneName}: ${zoneData.humidity.toFixed(1)}%`);
        }
    });
}

// Add alert to the alerts list
function addAlert(type, message) {
    const alert = {
        type: type,
        message: message,
        timestamp: new Date()
    };
    
    // Avoid duplicate alerts
    const isDuplicate = alerts.some(a => 
        a.message === message && 
        (new Date() - a.timestamp) < 60000 // Within last minute
    );
    
    if (!isDuplicate) {
        alerts.unshift(alert);
        if (alerts.length > 20) alerts.pop(); // Keep only last 20
        
        updateAlertsDisplay();
    }
}

// Update alerts display
function updateAlertsDisplay() {
    const container = document.getElementById('alertsList');
    container.innerHTML = '';
    
    alerts.slice(0, 10).forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = `alert-item ${alert.type}`;
        alertEl.innerHTML = `
            <div>${alert.message}</div>
            <div class="alert-time">${alert.timestamp.toLocaleTimeString()}</div>
        `;
        container.appendChild(alertEl);
    });
}

// Load historical data for charts
async function loadHistoricalData() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/sensor-data?hours=24`);
        if (response.ok) {
            const data = await response.json();
            // Re-initialize charts with historical data
            initializeCharts(data);
        }
    } catch (error) {
        console.error('Error loading historical data:', error);
        // Charts are already initialized, they'll just show empty
    }
}

// Start periodic data updates
function startPeriodicUpdates() {
    // Update stats periodically
    setInterval(async () => {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/stats?hours=24`);
            const stats = await response.json();
            document.getElementById('totalWater').textContent = 
                `${stats.total_water_applied.toFixed(0)} ml`;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, CONFIG.DATA_UPDATE_INTERVAL);
}

// Update zone configuration
function updateZoneConfig(zoneId, config) {
    // Update zone name if changed
    const zoneNameEl = document.querySelector(`#zone-${zoneId} .zone-name`);
    if (zoneNameEl && config.name) {
        zoneNameEl.textContent = config.name;
    }
}

