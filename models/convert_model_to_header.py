"""
Convert TensorFlow Lite model to C header file for ESP32 firmware.
"""

import os

def convert_tflite_to_header(tflite_path, output_path):
    """Convert .tflite file to C header file."""
    
    if not os.path.exists(tflite_path):
        print(f"Error: Model file {tflite_path} not found!")
        print("Please run train_model.py and convert_to_tflite.py first.")
        return False
    
    # Read the .tflite file
    with open(tflite_path, 'rb') as f:
        model_data = f.read()
    
    # Convert to C array
    array_name = 'irrigation_model_tflite'
    header_content = f'#ifndef IRRIGATION_MODEL_H\n'
    header_content += f'#define IRRIGATION_MODEL_H\n\n'
    header_content += f'#include "tensorflow/lite/micro/micro_interpreter.h"\n\n'
    header_content += f'const unsigned char {array_name}[] = {{\n'
    
    # Write bytes in hex format
    bytes_per_line = 12
    for i in range(0, len(model_data), bytes_per_line):
        line_bytes = model_data[i:i+bytes_per_line]
        hex_bytes = ', '.join(f'0x{b:02x}' for b in line_bytes)
        header_content += f'  {hex_bytes},\n'
    
    header_content += '};\n\n'
    header_content += f'const unsigned int {array_name}_len = {len(model_data)};\n\n'
    header_content += '#endif\n'
    
    # Write header file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(header_content)
    
    print(f"Model converted successfully!")
    print(f"Input: {tflite_path}")
    print(f"Output: {output_path}")
    print(f"Model size: {len(model_data) / 1024:.2f} KB")
    
    return True

if __name__ == '__main__':
    tflite_model = 'firmware/models/irrigation_model.tflite'
    header_file = 'firmware/main/irrigation_model.h'
    
    convert_tflite_to_header(tflite_model, header_file)

