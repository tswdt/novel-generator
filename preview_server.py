import http.server
import socketserver
import os

PORT = 3001
DIRECTORY = "preview"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"服务器运行在 http://localhost:{PORT}")
    print(f"预览页面目录: {os.path.abspath(DIRECTORY)}")
    print("\n可访问的页面:")
    print(f"  - 首页: http://localhost:{PORT}/home.html")
    print(f"  - 工作台: http://localhost:{PORT}/dashboard.html")
    print("\n按 Ctrl+C 停止服务器")
    httpd.serve_forever()
