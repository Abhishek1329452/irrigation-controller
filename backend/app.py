"""
Flask Backend Server for Intelligent Irrigation Controller
Handles API requests, WebSocket connections, and data storage.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime, timedelta
import json
import os
from collections import defaultdict
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'irrigation-controller-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory data storage (replace with database in production)
sensor_data = defaultdict(list)
zone_configs = {
    0: {'name': 'Zone 1 - Tomatoes', 'enabled': True, 'min_moisture': 40},
    1: {'name': 'Zone 2 - Lettuce', 'enabled': True, 'min_moisture': 45},
    2: {'name': 'Zone 3 - Herbs', 'enabled': True, 'min_moisture': 50},
    3: {'name': 'Zone 4 - Flowers', 'enabled': True, 'min_moisture': 35},
}
system_status = {
    'online': False,
    'last_update': None,
    'pump_running': False,
    'active_zones': []
}

@app.route('/')
def index():
    """Health check endpoint."""
    return jsonify({
        'status': 'online',
        'service': 'Intelligent Irrigation Controller API',
        'version': '1.0.0'
    })

@app.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    """Receive sensor data from ESP32."""
    try:
        data = request.json
        timestamp = datetime.now().isoformat()
        
        # Store sensor data (only process zone keys, ignore system keys)
        for zone_id_str, zone_data in data.items():
            # Skip non-zone keys like 'pump_running', 'active_zones'
            if zone_id_str in ['pump_running', 'active_zones']:
                continue
            
            try:
                zone_id = int(zone_id_str)
            except (ValueError, TypeError):
                # Skip if zone_id is not a valid integer
                continue
            
            # Ensure zone_data is a dictionary
            if not isinstance(zone_data, dict):
                continue
                
            sensor_data[zone_id].append({
                'timestamp': timestamp,
                'soil_moisture': zone_data.get('soil_moisture'),
                'temperature': zone_data.get('temperature'),
                'humidity': zone_data.get('humidity'),
                'water_prediction': zone_data.get('water_prediction'),
                'water_applied': zone_data.get('water_applied', 0)
            })
            
            # Keep only last 1000 readings per zone
            if len(sensor_data[zone_id]) > 1000:
                sensor_data[zone_id] = sensor_data[zone_id][-1000:]
        
        system_status['online'] = True
        system_status['last_update'] = timestamp
        system_status['pump_running'] = data.get('pump_running', False)
        system_status['active_zones'] = data.get('active_zones', [])
        
        # Emit to connected clients via WebSocket
        socketio.emit('sensor_update', {
            'data': data,
            'timestamp': timestamp,
            'status': system_status
        })
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"Error receiving sensor data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/sensor-data', methods=['GET'])
def get_sensor_data():
    """Get historical sensor data."""
    zone_id = request.args.get('zone_id', type=int)
    hours = request.args.get('hours', 24, type=int)
    
    cutoff_time = datetime.now() - timedelta(hours=hours)
    
    if zone_id is not None:
        # Return data for specific zone
        zone_data = sensor_data.get(zone_id, [])
        filtered_data = [
            d for d in zone_data 
            if datetime.fromisoformat(d['timestamp']) >= cutoff_time
        ]
        return jsonify({'zone_id': zone_id, 'data': filtered_data})
    else:
        # Return data for all zones
        all_data = {}
        for zid in sensor_data.keys():
            zone_data = sensor_data[zid]
            filtered_data = [
                d for d in zone_data 
                if datetime.fromisoformat(d['timestamp']) >= cutoff_time
            ]
            all_data[zid] = filtered_data
        return jsonify(all_data)

@app.route('/api/zones', methods=['GET'])
def get_zones():
    """Get zone configurations."""
    return jsonify(zone_configs)

@app.route('/api/zones/<int:zone_id>', methods=['PUT'])
def update_zone(zone_id):
    """Update zone configuration."""
    if zone_id not in zone_configs:
        return jsonify({'status': 'error', 'message': 'Zone not found'}), 404
    
    data = request.json
    zone_configs[zone_id].update(data)
    
    # Emit update via WebSocket
    socketio.emit('zone_config_update', {
        'zone_id': zone_id,
        'config': zone_configs[zone_id]
    })
    
    return jsonify({'status': 'success', 'config': zone_configs[zone_id]})

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status."""
    return jsonify(system_status)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics."""
    hours = request.args.get('hours', 24, type=int)
    cutoff_time = datetime.now() - timedelta(hours=hours)
    
    stats = {}
    total_water = 0
    
    for zone_id in range(4):
        zone_data = sensor_data.get(zone_id, [])
        filtered_data = [
            d for d in zone_data 
            if datetime.fromisoformat(d['timestamp']) >= cutoff_time
        ]
        
        if filtered_data:
            stats[zone_id] = {
                'readings': len(filtered_data),
                'avg_soil_moisture': sum(d['soil_moisture'] for d in filtered_data) / len(filtered_data),
                'avg_temperature': sum(d['temperature'] for d in filtered_data) / len(filtered_data),
                'avg_humidity': sum(d['humidity'] for d in filtered_data) / len(filtered_data),
                'total_water_applied': sum(d.get('water_applied', 0) for d in filtered_data),
            }
            total_water += stats[zone_id]['total_water_applied']
        else:
            stats[zone_id] = {
                'readings': 0,
                'avg_soil_moisture': 0,
                'avg_temperature': 0,
                'avg_humidity': 0,
                'total_water_applied': 0,
            }
    
    stats['total_water_applied'] = total_water
    return jsonify(stats)

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection."""
    print('Client connected')
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection."""
    print('Client disconnected')

def simulate_data():
    """Simulate sensor data for demo/testing purposes."""
    import random
    while True:
        time.sleep(30)  # Simulate data every 30 seconds
        if not system_status['online']:  # Only if no real device connected
            simulated_data = {}
            for zone_id in range(4):
                simulated_data[str(zone_id)] = {
                    'soil_moisture': random.uniform(30, 70),
                    'temperature': random.uniform(20, 28),
                    'humidity': random.uniform(40, 80),
                    'water_prediction': random.uniform(10, 50),
                    'water_applied': 0
                }
            
            # Simulate receiving data
            with app.test_request_context():
                from flask import json as flask_json
                request.json = simulated_data
                receive_sensor_data()

if __name__ == '__main__':
    # Start simulation thread (optional, for demo)
    # sim_thread = threading.Thread(target=simulate_data, daemon=True)
    # sim_thread.start()
    
    # Get port from environment variable (for cloud hosting) or use default
    import os
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print("Starting Intelligent Irrigation Controller API Server...")
    print(f"Server running on http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=debug)

