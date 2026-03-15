#!/bin/bash
# clean_temp.sh
# 临时文件清理脚本
# 每周日凌晨执行

echo "=========================================="
echo "开始清理临时文件"
echo "时间: $(date)"
echo "=========================================="

# 清理后端临时文件
echo "[1/4] 清理后端临时文件..."
if [ -d "/root/novel-generator/backend/temp" ]; then
    rm -rf /root/novel-generator/backend/temp/*
    echo "✓ 后端临时文件已清理"
else
    echo "✓ 后端临时目录不存在，跳过"
fi

# 清理前端构建缓存
echo "[2/4] 清理前端构建缓存..."
if [ -d "/root/novel-generator/frontend/.next/cache" ]; then
    rm -rf /root/novel-generator/frontend/.next/cache/*
    echo "✓ 前端构建缓存已清理"
else
    echo "✓ 前端缓存目录不存在，跳过"
fi

# 清理Docker无用镜像/容器
echo "[3/4] 清理Docker无用资源..."
docker system prune -f --volumes
echo "✓ Docker无用资源已清理"

# 清理日志文件（保留最近5个）
echo "[4/4] 清理旧日志文件..."
if [ -d "/root/novel-generator/backend/logs" ]; then
    cd /root/novel-generator/backend/logs
    ls -t app.log.* 2>/dev/null | tail -n +6 | xargs -r rm -f
    echo "✓ 旧日志文件已清理"
else
    echo "✓ 日志目录不存在，跳过"
fi

echo "=========================================="
echo "清理完成"
echo "时间: $(date)"
echo "=========================================="

# 显示磁盘使用情况
echo ""
echo "当前磁盘使用情况:"
df -h | grep -E "(/$|/var)"
