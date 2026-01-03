"""
Simulation mode for testing the irrigation controller without physical hardware.
Generates realistic sensor data and sends it to the backend API.
"""

import requests
import time
import random
import json
from datetime import datetime

API_URL = "http://localhost:5000/api/sensor-data"

def simulate_sensor_reading():
    """Generate realistic sensor data for 4 zones."""
    data = {
        "pump_running": False,
        "active_zones": []
    }
    
    for zone_id in range(4):
        # Simulate realistic sensor values
        soil_moisture = random.uniform(30, 75)
        temperature = random.uniform(18, 28)
        humidity = random.uniform(45, 85)
        
        # Simulate AI prediction (more water needed when moisture is low, temp is high)
        water_prediction = max(0, min(100, 
            (40 - soil_moisture) * 1.5 + 
            (temperature - 20) * 2 + 
            (70 - humidity) * 0.5 +
            random.uniform(-10, 10)
        ))
        
        # Determine if watering is needed
        needs_watering = soil_moisture < 40 and water_prediction > 20
        
        zone_data = {
            "soil_moisture": round(soil_moisture, 1),
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "water_prediction": round(water_prediction, 1),
            "water_applied": round(water_prediction, 1) if needs_watering else 0
        }
        
        data[str(zone_id)] = zone_data
        
        if needs_watering:
            data["active_zones"].append(zone_id)
            data["pump_running"] = True
    
    return data

def run_simulation():
    """Run the simulation and send data to the API."""
    print("Starting Irrigation Controller Simulation...")
    print(f"Sending data to: {API_URL}")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            sensor_data = simulate_sensor_reading()
            
            try:
                response = requests.post(
                    API_URL,
                    json=sensor_data,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                if response.status_code == 200:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    active_zones = sensor_data.get("active_zones", [])
                    pump_status = "ON" if sensor_data.get("pump_running") else "OFF"
                    
                    print(f"[{timestamp}] Data sent - Active zones: {active_zones}, Pump: {pump_status}")
                    
                    for zone_id in range(4):
                        zone_data = sensor_data[str(zone_id)]
                        print(f"  Zone {zone_id}: Moisture={zone_data['soil_moisture']:.1f}%, "
                              f"Temp={zone_data['temperature']:.1f}°C, "
                              f"Humidity={zone_data['humidity']:.1f}%, "
                              f"Prediction={zone_data['water_prediction']:.1f}ml")
                else:
                    print(f"Error: HTTP {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"Error sending data: {e}")
            
            # Wait before next reading
            time.sleep(30)  # Send data every 30 seconds
            
    except KeyboardInterrupt:
        print("\n\nSimulation stopped.")

if __name__ == "__main__":
    run_simulation()

