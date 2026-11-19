@echo off
cd /d C:\DataCenter
for /f %%i in ('git rev-parse HEAD') do set OLD=%%i
git pull --ff-only >> logs\update.log 2>&1
for /f %%i in ('git rev-parse HEAD') do set NEW=%%i
if "%OLD%"=="%NEW%" exit /b 0
echo %date% %time% updated %OLD% to %NEW% >> logs\update.log
git diff --name-only %OLD% %NEW% | findstr /B /C:"src/" /C:"server.js" >nul
if errorlevel 1 exit /b 0
rem Stop only the process listening on port 3000 (run-forever.bat restarts it in 5 s). Change 3000 if you set PORT.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do taskkill /PID %%a /F >nul
exit /b 0