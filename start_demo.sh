#!/bin/bash
# Bash script to start the demo mode (Linux/Mac)

echo "Starting Intelligent Irrigation Controller Demo..."
echo ""

# Start backend server in background
echo "Starting backend server..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start simulator in background
echo "Starting simulator..."
cd backend
python3 simulator.py &
SIMULATOR_PID=$!
cd ..

echo ""
echo "Backend server starting on http://localhost:5000"
echo "Simulator is generating test data"
echo ""
echo "Open frontend/index.html in your web browser to view the dashboard"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $SIMULATOR_PID 2>/dev/null; exit" INT
wait

