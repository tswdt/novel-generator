@echo off
chcp 65001 > nul
echo ==========================================
echo 预览服务器启动脚本
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查端口占用情况...
netstat -ano | findstr ":3003" > nul
if %errorlevel% == 0 (
    echo ⚠️ 端口 3003 已被占用，正在终止旧进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a > nul 2>&1
    )
    echo ✅ 已终止旧进程
)

echo.
echo [2/3] 启动预览服务器...
python preview_server.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ 服务器启动失败！
    echo.
    echo 可能的原因：
    echo 1. Python 未安装或未添加到 PATH
    echo 2. 端口 3003 被其他程序占用
    echo 3. preview_server.py 文件损坏
    echo.
    pause
    exit /b 1
)

pause
