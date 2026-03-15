from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
import webbrowser
import time

app = FastAPI(title="码字成书 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "码字成书 API 服务运行中", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/novels/create")
async def create_novel(request: Request):
    try:
        data = await request.json()
        print(f"[创建小说] 接收到数据: {data.get('title', '无标题')}")
        return {"success": True, "message": "小说创建成功"}
    except Exception as e:
        print(f"[错误] 创建小说失败: {e}")
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    print("=" * 60)
    print("  码字成书 - 后端服务器")
    print("=" * 60)
    print(f"  服务地址: http://localhost:8000")
    print(f"  健康检查: http://localhost:8000/health")
    print("")
    print("  按 Ctrl+C 停止服务器")
    print("=" * 60)
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
    except Exception as e:
        print(f"\n[错误] {e}")
