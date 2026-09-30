@echo off
color 0B
echo ===================================================
echo     AIOps Platform v2.4 - Autonomous Self-Healing
echo ===================================================
echo.

echo [1/3] Building React Command Center...
cd services\command-center
call npm install
call npm run build
cd ..\..

echo.
echo [2/3] Transferring build to API Gateway...
if not exist "services\api-gateway\static" mkdir "services\api-gateway\static"
del /Q /S "services\api-gateway\static\*" >nul 2>&1
xcopy /E /I /Y "services\command-center\dist\*" "services\api-gateway\static\" >nul

echo.
echo [3/3] Starting Docker Microservices...
docker-compose up -d --build

echo.
echo ===================================================
echo   SUCCESS! All systems are online.
echo.
echo   Access the Dashboard at:
echo   http://localhost:8001
echo ===================================================
echo.
pause
