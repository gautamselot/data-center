@echo off
rem Copies the in-app backups to another drive or network share. Edit DEST, then schedule it daily (see DEPLOY.md).
set DEST=\\backup-server\DataCenterBackups
rem set DEST=E:\Backups\DataCenter
cd /d %~dp0..
robocopy data\backups "%DEST%" *.db /XO /R:2 /W:5
exit /b 0
