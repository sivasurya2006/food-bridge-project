@echo off
title FoodBridge Platform Launcher
color 0A
cls
echo ======================================================================
echo                  FOODBRIDGE SMART RESCUE PLATFORM
echo ======================================================================
echo.
echo Starting backend and frontend development servers...
echo.

set PROJECT_DIR=%~dp0
if "%PROJECT_DIR:~-1%"=="\" set PROJECT_DIR=%PROJECT_DIR:~0,-1%

:: 1. Launch Backend in a separate window
echo [1/3] Starting Django Backend (http://127.0.0.1:8000)...
start "FoodBridge - Django Backend (Port 8000)" cmd /k "cd /d "%PROJECT_DIR%\backend" && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

:: 2. Launch Frontend in a separate window
echo [2/3] Starting React Vite Frontend (http://localhost:5173)...
start "FoodBridge - Vite Frontend (Port 5173)" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm run dev"

:: 3. Wait 3 seconds then open browser
echo [3/3] Initializing servers...
timeout /t 4 /nobreak > nul

echo.
echo Opening browser: http://localhost:5173
start http://localhost:5173

echo.
echo ======================================================================
echo FoodBridge is now running!
echo.
echo  * Frontend: http://localhost:5173
echo  * Backend:  http://127.0.0.1:8000/api/v1/
echo  * Admin:    http://127.0.0.1:8000/admin/
echo.
echo  Default Login Credentials:
echo   - Admin:      admin / admin123
echo   - Donor:      sakthivel / password123
echo   - NGO:        rajagurushri / password123
echo   - Volunteer:  prajin / password123
echo.
echo NOTE: Keep the two server terminal windows open while testing!
echo ======================================================================
echo.
pause
