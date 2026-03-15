# backend/start_gunicorn.py
import multiprocessing
import os
import sys
from gunicorn.app.base import BaseApplication

class FastAPIApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        for key, value in self.options.items():
            if key in self.cfg.settings and value is not None:
                self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

def create_logs_dir():
    """创建日志目录"""
    logs_dir = os.path.join(os.path.dirname(__file__), "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    return logs_dir

if __name__ == "__main__":
    # 创建日志目录
    logs_dir = create_logs_dir()
    
    # 2核CPU建议worker数=2*CPU核心数+1=5（但4G内存限制，设为3）
    workers = 3
    worker_class = "uvicorn.workers.UvicornWorker"  # 异步worker
    bind = "0.0.0.0:8000"
    timeout = 120  # AI调用超时时间放宽，避免进程被杀
    limit_request_line = 4096
    
    # 内存限制：每个worker约500M，3个+数据库≈2G，预留1G给系统/前端
    
    # 导入FastAPI app
    sys.path.insert(0, os.path.dirname(__file__))
    from main import app
    
    options = {
        "workers": workers,
        "worker_class": worker_class,
        "bind": bind,
        "timeout": timeout,
        "limit_request_line": limit_request_line,
        "accesslog": os.path.join(logs_dir, "access.log"),
        "errorlog": os.path.join(logs_dir, "error.log"),
        "loglevel": "warning",  # 关闭debug日志，减少IO和内存
        "capture_output": True,
        "enable_stdio_inheritance": True,
    }
    
    print("=" * 60)
    print("🚀 码字成书 - 后端服务启动")
    print("=" * 60)
    print(f"📊 工作进程数: {workers}")
    print(f"🔧 Worker类型: {worker_class}")
    print(f"🌐 绑定地址: {bind}")
    print(f"⏱️  超时时间: {timeout}秒")
    print(f"📝 访问日志: {options['accesslog']}")
    print(f"❌ 错误日志: {options['errorlog']}")
    print("=" * 60)
    print("✅ 生产环境优化配置已加载")
    print("💡 适用于: 2核4G服务器")
    print("=" * 60)
    
    FastAPIApplication(app, options).run()
