@echo off
echo Starting backend...
cd backend
start python main_simple.py
cd ..
echo Starting frontend...
start python start_server.py
echo Services started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3001
pause
