@echo off
cd /d "%~dp0"
py PREVIEW_LOCAL_ONLY.py 2>nul || python PREVIEW_LOCAL_ONLY.py
pause
