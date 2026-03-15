# ============================================
# 码字成书 - 后端Dockerfile (Alpine轻量版)
# 体积优化：从几百MB降至约100MB
# ============================================

# 使用Python 3.9 Alpine镜像
FROM python:3.9-alpine

# 设置工作目录
WORKDIR /app

# 安装编译依赖（Alpine需要手动安装gcc等）
# 安装PostgreSQL客户端库
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev \
    openssl-dev \
    python3-dev

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖（禁用缓存减少体积）
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 清理编译依赖（减小镜像体积）
RUN apk del gcc musl-dev python3-dev

# 复制应用代码
COPY . .

# 创建日志目录
RUN mkdir -p logs

# 设置环境变量
ENV ENV=production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# 启动命令（使用Gunicorn多进程启动）
CMD ["python", "start_gunicorn.py"]
