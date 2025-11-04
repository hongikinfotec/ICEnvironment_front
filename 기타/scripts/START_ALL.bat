@echo off
echo ========================================
echo Wastewater Monitoring System
echo Starting All Services...
echo ========================================
echo.

echo Starting Backend...
start "Backend Server" cmd /k "cd /d "%~dp0..\..\backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend Server" cmd /k "cd /d "%~dp0..\.." && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo System Started!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/api/docs
echo ========================================
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo To stop: Close both server windows
echo ========================================
