#!/bin/bash
# install_crontab.sh
# 安装定时任务脚本

echo "=========================================="
echo "安装定时清理任务"
echo "=========================================="

# 确保脚本有执行权限
chmod +x /root/novel-generator/clean_temp.sh

# 添加到crontab（每周日凌晨0点执行）
(crontab -l 2>/dev/null | grep -v "clean_temp.sh"; echo "0 0 * * 0 /root/novel-generator/clean_temp.sh >> /root/novel-generator/clean.log 2>&1") | crontab -

echo "✓ 定时任务已添加到crontab"
echo "✓ 执行时间: 每周日凌晨0点"
echo ""
echo "查看当前crontab:"
crontab -l
echo ""
echo "=========================================="
echo "定时任务安装完成"
echo "=========================================="
