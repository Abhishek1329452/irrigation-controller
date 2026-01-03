"""
Convert trained Keras model to TensorFlow Lite format for edge deployment.
"""

import tensorflow as tf
import os

def convert_to_tflite():
    """Convert Keras model to TensorFlow Lite."""
    
    # Load the trained model
    model_path = 'models/irrigation_model.h5'
    if not os.path.exists(model_path):
        print(f"Error: Model file {model_path} not found!")
        print("Please run train_model.py first.")
        return
    
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    # Convert to TensorFlow Lite
    print("Converting to TensorFlow Lite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimize for size and speed
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Convert
    tflite_model = converter.convert()
    
    # Save TFLite model
    os.makedirs('firmware/models', exist_ok=True)
    tflite_path = 'firmware/models/irrigation_model.tflite'
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"TensorFlow Lite model saved to {tflite_path}")
    
    # Print model size
    size_kb = len(tflite_model) / 1024
    print(f"Model size: {size_kb:.2f} KB")
    
    # Test inference (optional)
    print("\nTesting TFLite inference...")
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Output shape: {output_details[0]['shape']}")
    
    # Test with sample input
    test_input = [[50, 25, 60, 0, 12]]  # soil_moisture, temp, humidity, zone, hour
    interpreter.set_tensor(input_details[0]['index'], test_input)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    print(f"Test prediction: {output[0][0]:.2f} ml")

if __name__ == '__main__':
    convert_to_tflite()

