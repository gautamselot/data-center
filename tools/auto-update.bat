@echo off
cd /d C:\DataCenter
if not exist logs mkdir logs
for /f %%i in ('git rev-parse HEAD') do set OLD=%%i
git pull --ff-only >> logs\update.log 2>&1
for /f %%i in ('git rev-parse HEAD') do set NEW=%%i
if "%OLD%"=="%NEW%" exit /b 0
echo %date% %time% updated %OLD% to %NEW% >> logs\update.log
git diff --name-only %OLD% %NEW% | findstr /B /C:"src/" /C:"server.js" >nul && nssm restart DataCenter >> logs\update.log 2>&1
exit /b 0