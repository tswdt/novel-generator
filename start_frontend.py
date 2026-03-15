import http.server
import socketserver
import os
import webbrowser
import time

PORT = 3001
DIRECTORY = os.path.join(os.path.dirname(__file__), "preview")

os.chdir(DIRECTORY)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print("=" * 60)
            print("  码字成书 - 前端服务器")
            print("=" * 60)
            print(f"  服务目录: {os.path.abspath('.')}")
            print(f"  服务地址: http://localhost:{PORT}")
            print("")
            print("  可访问的页面:")
            print(f"    - 首页: http://localhost:{PORT}/home.html")
            print(f"    - 工作台: http://localhost:{PORT}/dashboard.html")
            print(f"    - 配置: http://localhost:{PORT}/config.html")
            print("")
            print("  按 Ctrl+C 停止服务器")
            print("=" * 60)
            
            try:
                time.sleep(1)
                print("\n[提示] 正在自动打开浏览器...")
                webbrowser.open(f"http://localhost:{PORT}/dashboard.html")
                print("[提示] 浏览器已打开，如果没有自动打开，请手动访问上面的地址")
            except:
                pass
            
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048:
            print("\n[错误] 端口 3001 已被占用！")
            print("[提示] 请先关闭其他使用该端口的程序")
        else:
            print(f"\n[错误] {e}")
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
    except Exception as e:
        print(f"\n[错误] {e}")

if __name__ == "__main__":
    start_server()
