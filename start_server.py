import http.server
import socketserver
import os

PORT = 3002
DIRECTORY = os.path.join(os.path.dirname(__file__), "preview")

os.chdir(DIRECTORY)

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"服务器运行在 http://localhost:{PORT}")
    print(f"服务目录: {os.path.abspath('.')}")
    print("\n可访问的页面:")
    print(f"  - 首页: http://localhost:{PORT}/home.html")
    print(f"  - 工作台: http://localhost:{PORT}/dashboard.html")
    print(f"  - 配置: http://localhost:{PORT}/config.html")
    print("\n按 Ctrl+C 停止服务器")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        httpd.shutdown()
