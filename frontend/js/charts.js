// Chart initialization and management
let moistureChart = null;
let tempHumidityChart = null;
let chartData = {};

// Initialize charts
function initializeCharts(historicalData) {
    // Process historical data if available
    if (historicalData && Object.keys(historicalData).length > 0) {
        processHistoricalData(historicalData);
    }
    // Always create charts (will show empty if no data)
    if (!moistureChart) {
        createMoistureChart();
    }
    if (!tempHumidityChart) {
        createTempHumidityChart();
    }
}

// Auto-initialize charts on page load (empty charts)
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        initializeCharts(null);
    }, 100);
});

// Process historical data for charts
function processHistoricalData(data) {
    chartData = {
        labels: [],
        moisture: { 0: [], 1: [], 2: [], 3: [] },
        temperature: { 0: [], 1: [], 2: [], 3: [] },
        humidity: { 0: [], 1: [], 2: [], 3: [] }
    };
    
    if (!data || Object.keys(data).length === 0) {
        return; // No data to process
    }
    
    // Collect all unique timestamps first
    const allTimestamps = [];
    Object.keys(data).forEach(zoneId => {
        const zoneData = data[zoneId];
        if (Array.isArray(zoneData)) {
            zoneData.forEach(reading => {
                if (reading.timestamp && !allTimestamps.includes(reading.timestamp)) {
                    allTimestamps.push(reading.timestamp);
                }
            });
        }
    });
    
    // Sort timestamps
    allTimestamps.sort();
    
    // Convert to time labels
    chartData.labels = allTimestamps.map(ts => {
        const date = new Date(ts);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    });
    
    // Process data for each zone, aligning with timestamps
    Object.keys(data).forEach(zoneId => {
        const zoneData = data[zoneId];
        const zid = parseInt(zoneId);
        
        if (Array.isArray(zoneData) && zid >= 0 && zid <= 3) {
            // Initialize arrays with null values
            chartData.moisture[zid] = new Array(chartData.labels.length).fill(null);
            chartData.temperature[zid] = new Array(chartData.labels.length).fill(null);
            chartData.humidity[zid] = new Array(chartData.labels.length).fill(null);
            
            zoneData.forEach(reading => {
                const timestampIndex = allTimestamps.indexOf(reading.timestamp);
                if (timestampIndex !== -1) {
                    chartData.moisture[zid][timestampIndex] = reading.soil_moisture;
                    chartData.temperature[zid][timestampIndex] = reading.temperature;
                    chartData.humidity[zid][timestampIndex] = reading.humidity;
                }
            });
        }
    });
    
    // Limit to last 50 points for performance
    if (chartData.labels.length > 50) {
        const startIdx = chartData.labels.length - 50;
        chartData.labels = chartData.labels.slice(startIdx);
        [0, 1, 2, 3].forEach(zid => {
            if (chartData.moisture[zid]) {
                chartData.moisture[zid] = chartData.moisture[zid].slice(startIdx);
                chartData.temperature[zid] = chartData.temperature[zid].slice(startIdx);
                chartData.humidity[zid] = chartData.humidity[zid].slice(startIdx);
            }
        });
    }
}

// Create soil moisture chart
function createMoistureChart() {
    const ctx = document.getElementById('moistureChart');
    if (!ctx) return;
    
    const zoneNames = [
        CONFIG.ZONE_NAMES[0] || 'Zone 1',
        CONFIG.ZONE_NAMES[1] || 'Zone 2',
        CONFIG.ZONE_NAMES[2] || 'Zone 3',
        CONFIG.ZONE_NAMES[3] || 'Zone 4'
    ];
    
    const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c'];
    
    // Prepare data arrays
    const datasets = [0, 1, 2, 3].map((zoneId, idx) => {
        const dataArray = chartData.moisture[zoneId] || [];
        // Filter out null values and ensure array is properly formatted
        const cleanData = dataArray.length > 0 ? dataArray : [];
        return {
            label: zoneNames[zoneId],
            data: cleanData,
            borderColor: colors[idx],
            backgroundColor: colors[idx] + '20',
            tension: 0.4,
            fill: false,
            spanGaps: true // Connect points across null values
        };
    });
    
    moistureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels.length > 0 ? chartData.labels : ['No Data'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b8b8b8' },
                    grid: { color: '#2d3748' }
                },
                y: {
                    ticks: { color: '#b8b8b8' },
                    grid: { color: '#2d3748' },
                    title: {
                        display: true,
                        text: 'Moisture %',
                        color: '#b8b8b8'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Create temperature and humidity chart
function createTempHumidityChart() {
    const ctx = document.getElementById('tempHumidityChart');
    if (!ctx) return;
    
    const zoneNames = [
        CONFIG.ZONE_NAMES[0] || 'Zone 1',
        CONFIG.ZONE_NAMES[1] || 'Zone 2'
    ];
    
    const tempData = chartData.temperature[0] || [];
    const humidityData = chartData.humidity[0] || [];
    
    tempHumidityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels.length > 0 ? chartData.labels : ['No Data'],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempData.length > 0 ? tempData : [],
                    borderColor: '#e74c3c',
                    backgroundColor: '#e74c3c20',
                    yAxisID: 'y',
                    tension: 0.4,
                    spanGaps: true
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData.length > 0 ? humidityData : [],
                    borderColor: '#3498db',
                    backgroundColor: '#3498db20',
                    yAxisID: 'y1',
                    tension: 0.4,
                    spanGaps: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#b8b8b8' },
                    grid: { color: '#2d3748' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#b8b8b8' },
                    grid: { color: '#2d3748' },
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#b8b8b8'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: '#b8b8b8' },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: '#b8b8b8'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Update charts with new data
function updateCharts(data) {
    if (!data || Object.keys(data).length === 0) {
        return; // No data to update
    }
    
    // Add new data point to chart data
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update moisture chart
    if (moistureChart && moistureChart.data.datasets) {
        Object.keys(data).forEach(zoneId => {
            // Skip system keys
            if (zoneId === 'pump_running' || zoneId === 'active_zones') {
                return;
            }
            
            try {
                const zid = parseInt(zoneId);
                const zoneData = data[zoneId];
                
                if (zoneData && typeof zoneData === 'object' && 
                    moistureChart.data.datasets[zid] && 
                    zoneData.soil_moisture !== undefined) {
                    
                    moistureChart.data.datasets[zid].data.push(zoneData.soil_moisture);
                    
                    // Limit to last 50 points
                    if (moistureChart.data.datasets[zid].data.length > 50) {
                        moistureChart.data.datasets[zid].data.shift();
                    }
                }
            } catch (e) {
                console.warn('Error updating moisture chart for zone', zoneId, e);
            }
        });
        
        moistureChart.data.labels.push(timeLabel);
        if (moistureChart.data.labels.length > 50) {
            moistureChart.data.labels.shift();
        }
        
        moistureChart.update('none');
    }
    
    // Update temp/humidity chart
    if (tempHumidityChart && data['0']) {
        const zoneData = data['0'];
        
        try {
            if (tempHumidityChart.data.datasets[0] && zoneData.temperature !== undefined) {
                tempHumidityChart.data.datasets[0].data.push(zoneData.temperature);
                if (tempHumidityChart.data.datasets[0].data.length > 50) {
                    tempHumidityChart.data.datasets[0].data.shift();
                }
            }
            
            if (tempHumidityChart.data.datasets[1] && zoneData.humidity !== undefined) {
                tempHumidityChart.data.datasets[1].data.push(zoneData.humidity);
                if (tempHumidityChart.data.datasets[1].data.length > 50) {
                    tempHumidityChart.data.datasets[1].data.shift();
                }
            }
            
            tempHumidityChart.data.labels.push(timeLabel);
            if (tempHumidityChart.data.labels.length > 50) {
                tempHumidityChart.data.labels.shift();
            }
            
            tempHumidityChart.update('none');
        } catch (e) {
            console.warn('Error updating temp/humidity chart', e);
        }
    }
}

