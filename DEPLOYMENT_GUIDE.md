# 码字成书 - 部署与维护指南

## 目录
- [系统要求](#系统要求)
- [快速部署](#快速部署)
- [日志管理](#日志管理)
- [临时文件清理](#临时文件清理)
- [性能监控](#性能监控)
- [故障排查](#故障排查)
- [备份与恢复](#备份与恢复)

---

## 系统要求

### 最低配置
- **CPU**: 2核
- **内存**: 4GB
- **硬盘**: 20GB
- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **软件**: Docker 20.10+, Docker Compose 2.0+

### 推荐配置
- **CPU**: 4核
- **内存**: 8GB
- **硬盘**: 50GB SSD
- **网络**: 10Mbps+

---

## 快速部署

### 1. 克隆项目
```bash
git clone https://github.com/tswdt/novel-generator.git
cd novel-generator
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填写必要的配置
```

### 3. 启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 安装Systemd服务（推荐）
```bash
sudo ./deploy/install-service.sh
sudo systemctl start novel-generator
sudo systemctl enable novel-generator
```

### 5. 安装定时清理任务
```bash
sudo ./deploy/install_crontab.sh
```

---

## 日志管理

### 日志配置

**后端日志** (`backend/logs/`):
- `app.log`: 应用主日志（轮转配置：500MB/文件，保留5个备份）
- `access.log`: 访问日志（Gunicorn生成）
- `error.log`: 错误日志（Gunicorn生成）

**日志轮转配置**:
```python
# backend/config.py
def setup_logging():
    log_handler = RotatingFileHandler(
        './logs/app.log',
        maxBytes=500 * 1024 * 1024,  # 500MB
        backupCount=5,                 # 保留5个备份
        encoding='utf-8'
    )
    log_handler.setLevel(logging.WARNING)  # 只记录警告及以上
```

### 查看日志

**实时查看日志**:
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看Systemd服务日志
sudo journalctl -u novel-generator -f
```

**查看历史日志**:
```bash
# 查看应用日志
tail -f backend/logs/app.log

# 查看访问日志
tail -f backend/logs/access.log

# 查看错误日志
tail -f backend/logs/error.log

# 查看最近100行
tail -n 100 backend/logs/app.log
```

**搜索日志**:
```bash
# 搜索错误
grep "ERROR" backend/logs/app.log

# 搜索特定时间
grep "2024-03-15" backend/logs/app.log

# 搜索特定用户
grep "user_id=123" backend/logs/app.log
```

### 日志分析

**统计错误数量**:
```bash
grep -c "ERROR" backend/logs/app.log
```

**统计API调用次数**:
```bash
grep "POST /api" backend/logs/access.log | wc -l
```

**查找慢查询**:
```bash
grep "duration" backend/logs/app.log | awk '$NF > 1000'
```

---

## 临时文件清理

### 自动清理

**定时任务配置**:
```bash
# 每周日凌晨0点执行
0 0 * * 0 /root/novel-generator/clean_temp.sh >> /root/novel-generator/clean.log 2>&1
```

**清理脚本内容** (`clean_temp.sh`):
```bash
#!/bin/bash
# 清理后端临时文件
rm -rf /root/novel-generator/backend/temp/*

# 清理前端构建缓存
rm -rf /root/novel-generator/frontend/.next/cache/*

# 清理Docker无用镜像/容器
docker system prune -f --volumes

# 清理旧日志文件（保留最近5个）
cd /root/novel-generator/backend/logs
ls -t app.log.* 2>/dev/null | tail -n +6 | xargs -r rm -f
```

### 手动清理

**立即执行清理**:
```bash
# 执行清理脚本
./clean_temp.sh

# 查看清理日志
cat clean.log
```

**清理特定资源**:
```bash
# 清理Docker镜像
docker image prune -a

# 清理Docker容器
docker container prune

# 清理Docker卷
docker volume prune

# 清理Docker网络
docker network prune

# 清理所有Docker资源
docker system prune -a --volumes
```

**查看磁盘使用情况**:
```bash
# 查看总体磁盘使用
df -h

# 查看Docker磁盘使用
docker system df

# 查看各容器磁盘使用
docker ps --format "table {{.Names}}\t{{.Size}}"

# 查看目录大小
du -sh /root/novel-generator/*
```

---

## 性能监控

### 系统资源监控

**实时监控**:
```bash
# CPU和内存使用
htop

# 磁盘IO
iotop

# 网络流量
iftop

# 进程监控
top
```

**Docker资源监控**:
```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats novel-generator-backend

# 持续监控
docker stats --no-stream
```

### 应用性能监控

**数据库性能**:
```bash
# 连接到PostgreSQL
docker exec -it novel-generator-db psql -U postgres -d novel_generator

# 查看活跃连接
SELECT count(*) FROM pg_stat_activity;

# 查看慢查询
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

**Redis性能**:
```bash
# 连接到Redis
docker exec -it novel-generator-redis redis-cli

# 查看信息
INFO

# 查看内存使用
INFO memory

# 查看缓存命中率
INFO stats | grep keyspace_hits

# 查看慢查询
SLOWLOG GET 10
```

**后端性能**:
```bash
# 查看Gunicorn进程
ps aux | grep gunicorn

# 查看连接数
netstat -an | grep 8000 | wc -l

# 查看请求响应时间
tail -f backend/logs/access.log | awk '{print $NF}'
```

### 监控指标

**关键指标**:
- **CPU使用率**: < 80%
- **内存使用率**: < 85%
- **磁盘使用率**: < 80%
- **数据库连接数**: < 40
- **Redis内存使用**: < 100MB
- **API响应时间**: < 2s
- **缓存命中率**: > 60%

**告警阈值**:
```bash
# CPU使用率 > 90%
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'

# 内存使用率 > 90%
free | grep Mem | awk '{printf("%.0f"), $3/$2 * 100.0}'

# 磁盘使用率 > 90%
df -h | awk '$5+0 > 90 {print $0}'
```

---

## 故障排查

### 常见问题

**1. 服务无法启动**
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs backend

# 检查端口占用
netstat -tlnp | grep 8000

# 检查磁盘空间
df -h
```

**2. 数据库连接失败**
```bash
# 检查数据库状态
docker-compose ps postgres

# 测试数据库连接
docker exec -it novel-generator-db pg_isready -U postgres

# 查看数据库日志
docker-compose logs postgres

# 检查连接数
docker exec -it novel-generator-db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

**3. Redis连接失败**
```bash
# 检查Redis状态
docker-compose ps redis

# 测试Redis连接
docker exec -it novel-generator-redis redis-cli ping

# 查看Redis日志
docker-compose logs redis

# 检查Redis内存
docker exec -it novel-generator-redis redis-cli INFO memory
```

**4. 内存不足**
```bash
# 查看内存使用
free -h

# 查看进程内存使用
ps aux --sort=-%mem | head -10

# 查看Docker容器内存
docker stats --no-stream

# 清理缓存
sync && echo 3 > /proc/sys/vm/drop_caches
```

**5. 磁盘空间不足**
```bash
# 查看磁盘使用
df -h

# 查看目录大小
du -sh /root/novel-generator/*

# 清理Docker资源
docker system prune -a --volumes

# 清理日志
./clean_temp.sh
```

### 日志分析

**查找错误**:
```bash
# 查找最近1小时的错误
find backend/logs -name "*.log" -mmin -60 -exec grep -l "ERROR" {} \;

# 统计错误类型
grep "ERROR" backend/logs/app.log | awk '{print $3}' | sort | uniq -c

# 查找异常堆栈
grep -A 10 "Traceback" backend/logs/app.log
```

**性能分析**:
```bash
# 查找慢请求
grep "duration" backend/logs/app.log | awk '$NF > 1000'

# 统计API调用频率
grep "POST /api" backend/logs/access.log | awk '{print $7}' | sort | uniq -c

# 查找高并发时段
awk '{print $1}' backend/logs/access.log | sort | uniq -c | sort -rn | head -10
```

---

## 备份与恢复

### 数据库备份

**自动备份**:
```bash
# 创建备份脚本
cat > /root/novel-generator/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/novel-generator/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec novel-generator-db pg_dump -U postgres novel_generator > $BACKUP_DIR/db_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: db_$DATE.sql.gz"
EOF

chmod +x /root/novel-generator/backup_db.sh

# 添加到crontab（每天凌晨2点）
(crontab -l 2>/dev/null | grep -v "backup_db.sh"; echo "0 2 * * * /root/novel-generator/backup_db.sh >> /root/novel-generator/backup.log 2>&1") | crontab -
```

**手动备份**:
```bash
# 备份数据库
docker exec novel-generator-db pg_dump -U postgres novel_generator > backup.sql

# 备份Redis
docker exec novel-generator-redis redis-cli BGSAVE
docker cp novel-generator-redis:/data/dump.rdb redis_backup.rdb

# 备份配置文件
tar -czf config_backup.tar.gz .env backend/config.py frontend/.env.local
```

### 数据恢复

**恢复数据库**:
```bash
# 停止服务
docker-compose stop backend

# 恢复数据库
docker exec -i novel-generator-db psql -U postgres novel_generator < backup.sql

# 启动服务
docker-compose start backend
```

**恢复Redis**:
```bash
# 停止Redis
docker-compose stop redis

# 恢复数据
docker cp redis_backup.rdb novel-generator-redis:/data/dump.rdb

# 启动Redis
docker-compose start redis
```

### 完整备份与恢复

**完整备份**:
```bash
#!/bin/bash
# backup_all.sh

BACKUP_DIR="/root/novel-generator/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec novel-generator-db pg_dump -U postgres novel_generator > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# 备份Redis
docker exec novel-generator-redis redis-cli BGSAVE
sleep 5
docker cp novel-generator-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 备份配置
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env backend/config.py frontend/.env.local

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/uploads/

echo "完整备份完成: $DATE"
```

**完整恢复**:
```bash
#!/bin/bash
# restore_all.sh

BACKUP_DIR="/root/novel-generator/backups"
DATE=$1

if [ -z "$DATE" ]; then
    echo "Usage: ./restore_all.sh <DATE>"
    exit 1
fi

# 停止服务
docker-compose stop

# 恢复数据库
gunzip < $BACKUP_DIR/db_$DATE.sql.gz | docker exec -i novel-generator-db psql -U postgres novel_generator

# 恢复Redis
docker-compose up -d redis
sleep 5
docker cp $BACKUP_DIR/redis_$DATE.rdb novel-generator-redis:/data/dump.rdb
docker-compose restart redis

# 恢复配置
tar -xzf $BACKUP_DIR/config_$DATE.tar.gz

# 恢复上传文件
tar -xzf $BACKUP_DIR/uploads_$DATE.tar.gz

# 启动服务
docker-compose up -d

echo "完整恢复完成: $DATE"
```

---

## 维护建议

### 日常维护
1. **每日检查**: 查看服务状态和日志
2. **每周清理**: 执行临时文件清理
3. **每月备份**: 验证备份文件完整性
4. **季度优化**: 分析性能指标，优化配置

### 监控告警
建议配置以下监控告警：
- 服务停止
- CPU使用率 > 90%
- 内存使用率 > 90%
- 磁盘使用率 > 85%
- API响应时间 > 5s
- 错误日志激增

### 安全建议
1. 定期更新系统和Docker
2. 使用强密码和密钥
3. 配置防火墙规则
4. 启用SSL/TLS
5. 定期审计日志

---

## 联系支持

- **文档**: https://github.com/tswdt/novel-generator
- **问题反馈**: https://github.com/tswdt/novel-generator/issues
- **技术支持**: support@novel-generator.com
