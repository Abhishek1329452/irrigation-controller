"""
AI Model Training Script for Irrigation Controller
Trains a lightweight model to predict water requirements based on sensor data.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os

def generate_synthetic_data(n_samples=10000):
    """
    Generate synthetic training data for irrigation prediction.
    In production, this would be replaced with real sensor data.
    
    Features:
    - Soil moisture (0-100%)
    - Temperature (Celsius)
    - Humidity (%)
    - Zone ID (0-3)
    - Time of day (hour)
    
    Target:
    - Water requirement (0-100 ml per zone)
    """
    np.random.seed(42)
    
    # Generate realistic sensor data
    soil_moisture = np.random.uniform(20, 80, n_samples)
    temperature = np.random.uniform(15, 35, n_samples)
    humidity = np.random.uniform(30, 90, n_samples)
    zone_id = np.random.randint(0, 4, n_samples)
    hour = np.random.randint(0, 24, n_samples)
    
    # Create features
    X = np.column_stack([soil_moisture, temperature, humidity, zone_id, hour])
    
    # Generate target (water requirement) based on rules + noise
    # Lower soil moisture = more water needed
    # Higher temperature = more water needed
    # Lower humidity = more water needed
    base_water = 100 - soil_moisture  # Inverse of moisture
    temp_factor = (temperature - 15) / 20  # 0 to 1 scale
    humidity_factor = (90 - humidity) / 60  # Inverse humidity
    time_factor = np.sin((hour - 6) * np.pi / 12)  # More water during day
    
    water_requirement = (base_water * 0.4 + 
                        temp_factor * 30 + 
                        humidity_factor * 20 + 
                        time_factor * 10)
    water_requirement = np.clip(water_requirement + np.random.normal(0, 5, n_samples), 0, 100)
    
    return X, water_requirement.reshape(-1, 1)

def create_model(input_shape):
    """Create a lightweight neural network for edge deployment."""
    model = keras.Sequential([
        layers.Dense(16, activation='relu', input_shape=(input_shape,)),
        layers.Dropout(0.2),
        layers.Dense(8, activation='relu'),
        layers.Dense(1, activation='relu')  # Water requirement (0-100 ml)
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_model():
    """Train the irrigation prediction model."""
    print("Generating synthetic training data...")
    X, y = generate_synthetic_data(n_samples=10000)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Create and train model
    print("Creating model...")
    model = create_model(X_train_scaled.shape[1])
    model.summary()
    
    print("Training model...")
    history = model.fit(
        X_train_scaled, y_train,
        batch_size=32,
        epochs=50,
        validation_data=(X_test_scaled, y_test),
        verbose=1
    )
    
    # Evaluate
    test_loss, test_mae = model.evaluate(X_test_scaled, y_test, verbose=0)
    print(f"\nTest MAE: {test_mae:.2f} ml")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    model.save('models/irrigation_model.h5')
    print("Model saved to models/irrigation_model.h5")
    
    # Save scaler for preprocessing
    import pickle
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    print("Scaler saved to models/scaler.pkl")
    
    return model, scaler

if __name__ == '__main__':
    train_model()

