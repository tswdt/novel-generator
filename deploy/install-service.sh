#!/bin/bash
# ============================================
# 码字成书 - Systemd服务安装脚本
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  码字成书 - Systemd服务安装${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查root权限
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用root权限运行此脚本${NC}"
    exit 1
fi

# 检查Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    echo -e "${YELLOW}请先安装Docker: https://docs.docker.com/engine/install/${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    echo -e "${YELLOW}请先安装Docker Compose${NC}"
    exit 1
fi

# 设置项目目录
PROJECT_DIR="/root/novel-generator"
SERVICE_FILE="/etc/systemd/system/novel-generator.service"

echo -e "${YELLOW}项目目录: ${PROJECT_DIR}${NC}"

# 创建项目目录（如果不存在）
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}创建项目目录...${NC}"
    mkdir -p "$PROJECT_DIR"
fi

# 复制服务文件
echo -e "${YELLOW}安装Systemd服务...${NC}"
cp novel-generator.service "$SERVICE_FILE"

# 重新加载Systemd
echo -e "${YELLOW}重新加载Systemd配置...${NC}"
systemctl daemon-reload

# 启用服务
echo -e "${YELLOW}启用服务...${NC}"
systemctl enable novel-generator.service

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}使用说明:${NC}"
echo -e "  启动服务: ${GREEN}systemctl start novel-generator${NC}"
echo -e "  停止服务: ${GREEN}systemctl stop novel-generator${NC}"
echo -e "  重启服务: ${GREEN}systemctl restart novel-generator${NC}"
echo -e "  查看状态: ${GREEN}systemctl status novel-generator${NC}"
echo -e "  查看日志: ${GREEN}journalctl -u novel-generator -f${NC}"
echo ""
echo -e "${YELLOW}注意: 请确保项目代码已放置在 ${PROJECT_DIR} 目录${NC}"
echo -e "${YELLOW}      并配置好 .env 文件后再启动服务${NC}"
