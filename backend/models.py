"""
Data models for the irrigation controller system.
"""

from datetime import datetime
from typing import Optional, Dict, List

class SensorReading:
    """Represents a single sensor reading from a zone."""
    
    def __init__(self, zone_id: int, soil_moisture: float, 
                 temperature: float, humidity: float,
                 water_prediction: Optional[float] = None,
                 water_applied: float = 0):
        self.zone_id = zone_id
        self.timestamp = datetime.now()
        self.soil_moisture = soil_moisture
        self.temperature = temperature
        self.humidity = humidity
        self.water_prediction = water_prediction
        self.water_applied = water_applied
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'zone_id': self.zone_id,
            'timestamp': self.timestamp.isoformat(),
            'soil_moisture': self.soil_moisture,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'water_prediction': self.water_prediction,
            'water_applied': self.water_applied
        }

class ZoneConfig:
    """Configuration for an irrigation zone."""
    
    def __init__(self, zone_id: int, name: str, enabled: bool = True,
                 min_moisture: float = 40, max_moisture: float = 80):
        self.zone_id = zone_id
        self.name = name
        self.enabled = enabled
        self.min_moisture = min_moisture
        self.max_moisture = max_moisture
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'zone_id': self.zone_id,
            'name': self.name,
            'enabled': self.enabled,
            'min_moisture': self.min_moisture,
            'max_moisture': self.max_moisture
        }

class SystemStatus:
    """Current system status."""
    
    def __init__(self):
        self.online = False
        self.last_update: Optional[datetime] = None
        self.pump_running = False
        self.active_zones: List[int] = []
        self.total_water_used_today = 0.0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'online': self.online,
            'last_update': self.last_update.isoformat() if self.last_update else None,
            'pump_running': self.pump_running,
            'active_zones': self.active_zones,
            'total_water_used_today': self.total_water_used_today
        }

