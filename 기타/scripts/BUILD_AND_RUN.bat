@echo off
echo ========================================
echo Building Production Version...
echo This will create a single-file application
echo ========================================
echo.

echo [1/2] Building Frontend...
cd /d "%~dp0..\.."
call npm run build
echo Frontend built successfully!

echo.
echo [2/2] Copying to Backend...
if exist "backend\dist" rmdir /s /q "backend\dist"
xcopy /E /I /Y "dist" "backend\dist"
echo Files copied successfully!

echo.
echo ========================================
echo Production Build Complete!
echo.
echo Now you can run with just ONE file:
echo   RUN_PRODUCTION.bat
echo ========================================
pause
