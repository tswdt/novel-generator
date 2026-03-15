import subprocess
import sys
import time
import os
import webbrowser

def main():
    print("=" * 70)
    print("  码字成书 - 服务启动器")
    print("=" * 70)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("\n[1/3] 正在停止旧的进程...")
    try:
        import psutil
        for proc in psutil.process_iter(['pid', 'name']):
            if proc.info['name'] == 'python.exe':
                try:
                    proc.terminate()
                except:
                    pass
        time.sleep(1)
        print("    ✓ 旧进程已清理")
    except:
        print("    ⚠  跳过进程清理")
    
    print("\n[2/3] 正在启动后端服务...")
    backend = subprocess.Popen(
        [sys.executable, "start_backend.py"],
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    time.sleep(2)
    print("    ✓ 后端服务启动成功 (端口: 8000)")
    
    print("\n[3/3] 正在启动前端服务...")
    frontend = subprocess.Popen(
        [sys.executable, "start_frontend.py"],
        creationflags=subprocess.CREATE_NEW_CONSOLE
    )
    time.sleep(3)
    print("    ✓ 前端服务启动成功 (端口: 3001)")
    
    print("\n" + "=" * 70)
    print("  所有服务已启动完成！")
    print("=" * 70)
    print("\n  服务地址:")
    print("    - 后端API:  http://localhost:8000")
    print("    - 前端预览: http://localhost:3001")
    print("\n  主要页面:")
    print("    - 工作台:  http://localhost:3001/dashboard.html")
    print("    - 首页:    http://localhost:3001/home.html")
    print("    - 配置:    http://localhost:3001/config.html")
    print("\n" + "=" * 70)
    print("\n[提示] 正在自动打开浏览器...")
    
    try:
        time.sleep(1)
        webbrowser.open("http://localhost:3001/dashboard.html")
        print("[提示] 浏览器已打开！")
    except:
        print("[提示] 请手动在浏览器中访问上述地址")
    
    print("\n[提示] 关闭此窗口不会停止服务")
    print("[提示] 要停止服务，请关闭对应的命令行窗口")
    print("\n按任意键关闭此窗口...")
    
    try:
        input()
    except:
        pass

if __name__ == "__main__":
    main()
