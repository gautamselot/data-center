@echo off
cd /d C:\DataCenter
if not exist logs mkdir logs
for /f %%i in ('git rev-parse HEAD') do set OLD=%%i
git pull --ff-only >> logs\update.log 2>&1
for /f %%i in ('git rev-parse HEAD') do set NEW=%%i
if "%OLD%"=="%NEW%" exit /b 0
echo %date% %time% updated %OLD% to %NEW% >> logs\update.log
git diff --name-only %OLD% %NEW% | findstr /B /C:"src/" /C:"server.js" >nul || exit /b 0
where node >nul 2>&1 || goto restart
set BADJS=
for /f "delims=" %%f in ('git diff --name-only --diff-filter=d %OLD% %NEW% ^| findstr /R "^src/.*\.js$ ^server\.js$"') do (
  node --check "%%f" >> logs\update.log 2>&1 || set BADJS=1
)
if defined BADJS (
  echo %date% %time% SYNTAX ERROR in new code, rolled back to %OLD% >> logs\update.log
  git reset --hard %OLD% >> logs\update.log 2>&1
  exit /b 1
)
:restart
nssm restart DataCenter >> logs\update.log 2>&1
exit /b 0