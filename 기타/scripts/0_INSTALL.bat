@echo off
echo ========================================
echo Installing packages (First time only)
echo ========================================
echo.

echo [1/2] Installing backend packages...
cd /d "%~dp0..\..\backend"
pip install -r requirements.txt

echo.
echo [2/2] Installing frontend packages...
cd /d "%~dp0..\.."
call npm install

echo.
echo ========================================
echo Installation complete!
echo Now run:
echo   1_START_BACKEND.bat
echo   2_START_FRONTEND.bat
echo ========================================
pause
