@echo off
rem Keeps Data Center running: restarts it 5 seconds after any crash. Run this at Windows startup (see DEPLOY.md).
rem Optional settings (remove "rem" to use):
rem set PORT=3000
rem set DATA_DIR=D:\DataCenterData
rem set BACKUP_KEEP=30
cd /d %~dp0..
if not exist logs mkdir logs
:loop
node server.js >> logs\server.log 2>&1
timeout /t 5 /nobreak >nul
goto loop
