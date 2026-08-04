@echo off
REM Double-click this file to backup your Zboun database into F:\zboun\backups\
cd /d "F:\zboun"
powershell -NoProfile -ExecutionPolicy Bypass -File "F:\zboun\backup-database.ps1"
echo.
pause
