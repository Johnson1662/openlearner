@echo off
setlocal

echo Running OpenLearner artifact cleanup...
powershell -ExecutionPolicy Bypass -File "%~dp0cleanup-empty-artifacts.ps1"

if %ERRORLEVEL% NEQ 0 (
  echo Cleanup failed.
  exit /b %ERRORLEVEL%
)

echo Cleanup finished.
exit /b 0
