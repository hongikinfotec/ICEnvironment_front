@echo off
echo ========================================
echo 하수처리장 방류수질 예측 모니터링 시스템
echo Backend API Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
    echo.
)

REM Activate virtual environment
echo [2/3] Activating virtual environment...
call venv\Scripts\activate
echo ✓ Virtual environment activated
echo.

REM Install dependencies
echo [3/3] Installing dependencies...
pip install -r requirements.txt
echo ✓ Dependencies installed
echo.

REM Run server
echo ========================================
echo Starting API Server...
echo ========================================
echo.
python run.py
