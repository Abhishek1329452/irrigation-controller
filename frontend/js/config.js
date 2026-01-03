// Configuration for the dashboard
const CONFIG = {
    // API endpoint - update this with your server IP/URL
    API_URL: 'https://irrigation-controller.onrender.com/',
    WS_URL: 'https://irrigation-controller.onrender.com/',
    
    // Update intervals (milliseconds)
    DATA_UPDATE_INTERVAL: 5000,
    CHART_UPDATE_INTERVAL: 30000,
    
    // Zone names (update to match your setup)
    ZONE_NAMES: {
        0: 'Zone 1 - Tomatoes',
        1: 'Zone 2 - Lettuce',
        2: 'Zone 3 - Herbs',
        3: 'Zone 4 - Flowers'
    },
    
    // Thresholds
    MOISTURE_LOW: 35,
    MOISTURE_HIGH: 70,
    TEMP_LOW: 15,
    TEMP_HIGH: 30,
    HUMIDITY_LOW: 40,
    HUMIDITY_HIGH: 80
};


