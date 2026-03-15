@echo off
chcp 65001 > nul
echo ====================================
echo    码字成书 - 启动服务
echo ====================================
echo.

echo [1/2] 启动后端服务...
cd /d "%~dp0\backend"
start /B python main_simple.py

echo [2/2] 启动前端服务...
cd /d "%~dp0"
start /B python start_server.py

echo.
echo ====================================
echo    服务启动完成！
echo ====================================
echo.
echo 后端: http://localhost:8000
echo 前端: http://localhost:3001
echo.
echo 请在浏览器中打开: http://localhost:3001/dashboard.html
echo.
echo 按任意键关闭此窗口（服务将继续运行）...
pause > nul
