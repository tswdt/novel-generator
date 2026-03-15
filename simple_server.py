import http.server
import socketserver
import os
import sys

PORT = 3001
DIRECTORY = os.path.join(os.path.dirname(__file__), "preview")

print(f"切换到目录: {DIRECTORY}")
os.chdir(DIRECTORY)

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

print(f"启动服务器在端口 {PORT}...")
print(f"服务目录: {os.path.abspath('.')}")
print(f"访问地址: http://localhost:{PORT}")
print(f"测试页面: http://localhost:{PORT}/test.html")
print(f"工作台: http://localhost:{PORT}/dashboard.html")
print("按 Ctrl+C 停止服务器")
print("=" * 60)

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n服务器已停止")
except Exception as e:
    print(f"错误: {e}")
    sys.exit(1)
