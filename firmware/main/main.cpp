/*
 * Intelligent Irrigation Controller - ESP32 Firmware
 * 
 * Features:
 * - Multi-zone sensor monitoring (soil moisture, temperature, humidity)
 * - Edge AI inference using TensorFlow Lite
 * - Automated pump and valve control
 * - WiFi connectivity for data transmission
 * - Real-time irrigation optimization
 * 
 * Hardware:
 * - ESP32 DevKit
 * - DHT22 sensors (temperature/humidity)
 * - Capacitive soil moisture sensors
 * - Relay modules for pump/valves
 * - 5V power supply for relays
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "irrigation_model.h"  // Generated from .tflite file

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server_url = "http://YOUR_SERVER_IP:5000/api/sensor-data";

// Sensor Pins
#define NUM_ZONES 4
#define DHT_PIN_0 4
#define DHT_PIN_1 5
#define DHT_PIN_2 18
#define DHT_PIN_3 19
#define SOIL_PIN_0 34  // ADC1_CH6
#define SOIL_PIN_1 35  // ADC1_CH7
#define SOIL_PIN_2 32  // ADC1_CH4
#define SOIL_PIN_3 33  // ADC1_CH5

// Control Pins
#define PUMP_PIN 25
#define VALVE_PIN_0 26
#define VALVE_PIN_1 27
#define VALVE_PIN_2 14
#define VALVE_PIN_3 12

// Sensor Objects
DHT dht0(DHT_PIN_0, DHT22);
DHT dht1(DHT_PIN_1, DHT22);
DHT dht2(DHT_PIN_2, DHT22);
DHT dht3(DHT_PIN_3, DHT22);
DHT dhts[NUM_ZONES] = {dht0, dht1, dht2, dht3};

// TensorFlow Lite Model
const tflite::Model* model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* input = nullptr;
TfLiteTensor* output = nullptr;
constexpr int kTensorArenaSize = 10 * 1024;
uint8_t tensor_arena[kTensorArenaSize];

// Timing
unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;
const unsigned long SENSOR_INTERVAL = 30000;  // 30 seconds
const unsigned long DATA_SEND_INTERVAL = 60000;  // 60 seconds

// Zone Data Structure
struct ZoneData {
  float soil_moisture;
  float temperature;
  float humidity;
  float water_prediction;
  bool needs_watering;
};

ZoneData zones[NUM_ZONES];

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Intelligent Irrigation Controller Starting...");
  
  // Initialize DHT sensors
  for (int i = 0; i < NUM_ZONES; i++) {
    dhts[i].begin();
  }
  
  // Initialize control pins
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  for (int i = 0; i < NUM_ZONES; i++) {
    pinMode(VALVE_PIN_0 + i, OUTPUT);
    digitalWrite(VALVE_PIN_0 + i, LOW);
  }
  
  // Initialize TensorFlow Lite
  Serial.println("Loading TensorFlow Lite model...");
  model = tflite::GetModel(irrigation_model_tflite);
  if (model->version() != TFLITE_SCHEMA_VERSION) {
    Serial.printf("Model schema version %d not supported. Supported version is %d.\n",
                  model->version(), TFLITE_SCHEMA_VERSION);
    return;
  }
  
  static tflite::AllOpsResolver resolver;
  static tflite::MicroInterpreter static_interpreter(
      model, resolver, tensor_arena, kTensorArenaSize);
  interpreter = &static_interpreter;
  
  TfLiteStatus allocate_status = interpreter->AllocateTensors();
  if (allocate_status != kTfLiteOk) {
    Serial.println("AllocateTensors() failed");
    return;
  }
  
  input = interpreter->input(0);
  output = interpreter->output(0);
  Serial.println("TensorFlow Lite model loaded successfully");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
  
  Serial.println("System ready!");
}

float readSoilMoisture(int pin) {
  // Read analog value and convert to percentage (0-100)
  // Calibrate based on your sensor
  int raw = analogRead(pin);
  float percentage = map(raw, 0, 4095, 0, 100);  // ESP32 ADC is 12-bit
  return constrain(percentage, 0, 100);
}

float predictWaterRequirement(int zone_id) {
  // Prepare input features: [soil_moisture, temperature, humidity, zone_id, hour]
  float hour = (millis() / 3600000) % 24;  // Current hour (0-23)
  
  // Normalize inputs (should match training data normalization)
  // For simplicity, using basic normalization - should match scaler from training
  input->data.f[0] = (zones[zone_id].soil_moisture - 50.0) / 30.0;  // Normalized
  input->data.f[1] = (zones[zone_id].temperature - 25.0) / 10.0;
  input->data.f[2] = (zones[zone_id].humidity - 60.0) / 30.0;
  input->data.f[3] = zone_id / 4.0;  // Normalize zone ID
  input->data.f[4] = (hour - 12.0) / 12.0;  // Normalize hour
  
  // Run inference
  TfLiteStatus invoke_status = interpreter->Invoke();
  if (invoke_status != kTfLiteOk) {
    Serial.println("Invoke failed!");
    return 0.0;
  }
  
  // Get prediction (denormalize if needed)
  float prediction = output->data.f[0];
  return constrain(prediction, 0, 100);  // Water requirement in ml
}

void readSensors() {
  for (int i = 0; i < NUM_ZONES; i++) {
    zones[i].soil_moisture = readSoilMoisture(SOIL_PIN_0 + i);
    zones[i].temperature = dhts[i].readTemperature();
    zones[i].humidity = dhts[i].readHumidity();
    
    // Check for sensor errors
    if (isnan(zones[i].temperature) || isnan(zones[i].humidity)) {
      Serial.printf("Error reading DHT sensor for zone %d\n", i);
      zones[i].temperature = 25.0;  // Default values
      zones[i].humidity = 60.0;
    }
    
    // Run AI prediction
    zones[i].water_prediction = predictWaterRequirement(i);
    
    // Determine if watering is needed (threshold-based)
    zones[i].needs_watering = (zones[i].soil_moisture < 40.0) && 
                              (zones[i].water_prediction > 20.0);
    
    Serial.printf("Zone %d: Moisture=%.1f%%, Temp=%.1f°C, Humidity=%.1f%%, "
                  "Prediction=%.1f ml, Need Water=%d\n",
                  i, zones[i].soil_moisture, zones[i].temperature,
                  zones[i].humidity, zones[i].water_prediction,
                  zones[i].needs_watering);
  }
}

void controlIrrigation() {
  bool pump_active = false;
  int active_zones = 0;
  
  // Check which zones need watering
  for (int i = 0; i < NUM_ZONES; i++) {
    if (zones[i].needs_watering) {
      digitalWrite(VALVE_PIN_0 + i, HIGH);
      pump_active = true;
      active_zones++;
      Serial.printf("Activating zone %d\n", i);
    } else {
      digitalWrite(VALVE_PIN_0 + i, LOW);
    }
  }
  
  // Control pump
  if (pump_active) {
    digitalWrite(PUMP_PIN, HIGH);
    Serial.println("Pump activated");
    delay(5000);  // Water for 5 seconds (adjust based on prediction)
    digitalWrite(PUMP_PIN, LOW);
    
    // Close all valves
    for (int i = 0; i < NUM_ZONES; i++) {
      digitalWrite(VALVE_PIN_0 + i, LOW);
    }
  }
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping data send");
    return;
  }
  
  HTTPClient http;
  http.begin(server_url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  DynamicJsonDocument doc(2048);
  doc["pump_running"] = digitalRead(PUMP_PIN);
  
  JsonArray active_zones_array = doc.createNestedArray("active_zones");
  
  for (int i = 0; i < NUM_ZONES; i++) {
    JsonObject zone_data = doc.createNestedObject(String(i));
    zone_data["soil_moisture"] = zones[i].soil_moisture;
    zone_data["temperature"] = zones[i].temperature;
    zone_data["humidity"] = zones[i].humidity;
    zone_data["water_prediction"] = zones[i].water_prediction;
    zone_data["water_applied"] = zones[i].needs_watering ? zones[i].water_prediction : 0;
    
    if (zones[i].needs_watering) {
      active_zones_array.add(i);
    }
  }
  
  String json_string;
  serializeJson(doc, json_string);
  
  int httpResponseCode = http.POST(json_string);
  if (httpResponseCode > 0) {
    Serial.printf("Data sent successfully, response code: %d\n", httpResponseCode);
  } else {
    Serial.printf("Error sending data: %d\n", httpResponseCode);
  }
  
  http.end();
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Read sensors periodically
  if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = currentMillis;
    readSensors();
    controlIrrigation();
  }
  
  // Send data to server periodically
  if (currentMillis - lastDataSend >= DATA_SEND_INTERVAL) {
    lastDataSend = currentMillis;
    sendDataToServer();
  }
  
  delay(100);
}

