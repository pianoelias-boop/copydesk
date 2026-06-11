@echo off
rem Double-click to start Copydesk (Windows). Opens your browser automatically.
cd /d "%~dp0"
echo Starting Copydesk...
py serve.py 2>nul || python serve.py
if errorlevel 1 (
  echo.
  echo Python 3 is required. Install it from https://www.python.org/downloads/
  echo ^(check "Add python.exe to PATH" during install^), then run this file again.
  pause
)
