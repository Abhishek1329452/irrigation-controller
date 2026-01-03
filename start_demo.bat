@echo off
REM Windows batch script to start the demo mode
echo Starting Intelligent Irrigation Controller Demo...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak >nul

echo Starting simulator...
start "Simulator" cmd /k "cd backend && python simulator.py"

echo.
echo Backend server starting on http://localhost:5000
echo Simulator is generating test data
echo.
echo Open frontend/index.html in your web browser to view the dashboard
echo.
pause

