@echo off
title FoodBridge - Backend Server
echo ==============================================
echo       FoodBridge Django REST Backend Server
echo ==============================================
cd /d "%~dp0backend"

if not exist "..\venv" (
    if not exist "venv" (
        echo [INFO] Setting up Python virtual environment...
        python -m venv venv
        call venv\Scripts\activate.bat
        echo [INFO] Installing backend dependencies...
        pip install -r requirements.txt
    ) else (
        call venv\Scripts\activate.bat
    )
) else (
    call "..\venv\Scripts\activate.bat"
)

echo [INFO] Running database migrations...
python manage.py migrate

echo.
echo [SUCCESS] Backend starting on http://127.0.0.1:8000/api/v1/
python manage.py runserver 0.0.0.0:8000
pause
