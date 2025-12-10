@echo off
echo Starting FreshCount...
cd backend
start "FreshCount Backend" cmd /k "npm run dev"
cd ..
start "FreshCount Frontend" cmd /k "npm run dev"
echo Done.
