@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  set PYCMD=py
) else (
  set PYCMD=python
)
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://localhost:8765'"
%PYCMD% -m http.server 8765
