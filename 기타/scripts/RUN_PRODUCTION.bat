@echo off
echo ========================================
echo Wastewater Monitoring System
echo Production Mode (Single Server)
echo ========================================
echo.

echo Starting integrated server...
echo.

cd /d "%~dp0..\..\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
