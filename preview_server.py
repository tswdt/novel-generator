import http.server
import socketserver
import os
import sys

PORT = 3003
DIRECTORY = "preview"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
            print(f"🚀 服务器运行在 http://127.0.0.1:{PORT}")
            print(f"📁 预览页面目录: {os.path.abspath(DIRECTORY)}")
            print("\n可访问的页面:")
            print(f"  - 首页: http://127.0.0.1:{PORT}/home.html")
            print(f"  - 工作台: http://127.0.0.1:{PORT}/dashboard.html")
            print(f"  - 登录: http://127.0.0.1:{PORT}/login.html")
            print(f"  - 注册: http://127.0.0.1:{PORT}/register.html")
            print(f"  - 配置: http://127.0.0.1:{PORT}/config.html")
            print(f"  - 测试: http://127.0.0.1:{PORT}/test.html")
            print(f"  - 番茄小说配置: http://127.0.0.1:{PORT}/fanqie_config.html")
            print(f"  - 导航页面: http://127.0.0.1:{PORT}/index.html")
            print("\n💡 提示:")
            print("   - 修改HTML文件后，直接刷新浏览器即可看到变化")
            print("   - 如果刷新后没有变化，请按 Ctrl+F5 强制刷新")
            print("   - 服务器已禁用缓存，确保您看到最新内容")
            print("\n按 Ctrl+C 停止服务器\n")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 正在停止服务器...")
        print("✅ 服务器已停止")
    except OSError as e:
        if "WinError 10048" in str(e) or "Address already in use" in str(e):
            print(f"❌ 端口 {PORT} 已被占用！")
            print("💡 解决方案:")
            print("   1. 查找占用端口的进程: netstat -ano | findstr 3003")
            print("   2. 终止进程: taskkill /F /PID <进程ID>")
            print("   3. 重新运行此脚本")
            sys.exit(1)
        else:
            raise

if __name__ == "__main__":
    start_server()
