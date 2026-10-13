@echo off
title FoodBridge - Frontend Server
echo ==============================================
echo        FoodBridge React + Vite Frontend
echo ==============================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] Installing frontend node dependencies...
    npm install
)

echo.
echo [SUCCESS] Frontend starting on http://localhost:5173/
npm run dev
pause
