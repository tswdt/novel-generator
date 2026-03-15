# 码字成书 - 后端优化指南

## 优化概述

本次优化针对 **2核4G** 服务器配置，从进程调度、AI服务、数据库三个维度进行全面优化，最大化利用资源且不超限。

---

## 1. 进程与资源调度优化

### 1.1 Gunicorn多进程启动

**文件**: `backend/start_gunicorn.py`

**优化配置**:
- **Worker数量**: 3个（2核CPU建议=2*核心数+1=5，但4G内存限制设为3）
- **Worker类型**: `uvicorn.workers.UvicornWorker`（异步worker）
- **超时时间**: 120秒（AI调用超时放宽，避免进程被杀）
- **内存预估**: 每个worker约500M，3个worker+数据库≈2G，预留1G给系统/前端

**启动命令**:
```bash
cd backend
python start_gunicorn.py
```

### 1.2 调试模式控制

**文件**: `backend/config.py`

```python
ENV: str = os.getenv("ENV", "production")
DEBUG: bool = ENV != "production"  # 生产环境强制关闭debug
```

**环境变量设置**:
```bash
# Linux/macOS
export ENV=production

# Windows PowerShell
$env:ENV="production"
```

---

## 2. AI服务优化

### 2.1 Redis缓存

**文件**: `backend/cache.py`

**缓存策略**:
| 缓存类型 | TTL | 说明 |
|---------|-----|------|
| 小说大纲 | 2小时 | 相同主题+题材+用户 |
| 书名建议 | 1小时 | 相同简介+题材 |
| 章节内容 | 2小时 | 相同小说ID+章节号 |
| 生成任务 | 1小时 | 任务状态跟踪 |
| 提示词模板 | 24小时 | 配置类数据 |
| 统计数据 | 5分钟 | 频繁更新的统计 |

**Redis配置** (config.py):
```python
REDIS_HOST: str = "localhost"
REDIS_PORT: int = 6379
REDIS_PASSWORD: str = ""
REDIS_DB: int = 0
REDIS_CACHE_TTL: int = 7200  # 默认2小时
```

**容错机制**: 如果Redis连接失败，应用会自动降级为无缓存模式，不影响核心功能。

### 2.2 AI服务缓存集成

**文件**: `backend/ai_service.py`

**带缓存的方法**:
- `generate_title_suggestions()` - 书名建议缓存
- `generate_novel_outline()` - 完整大纲缓存
- `generate_chapter()` - 章节内容缓存

**缓存标识**: 返回结果中包含 `"cached": true` 字段表示命中缓存。

---

## 3. 数据库优化

### 3.1 连接池配置

**文件**: `backend/database.py`

```python
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=8,          # 连接池大小
    max_overflow=2,       # 临时连接数
    pool_recycle=30,      # 30秒回收连接
    pool_pre_ping=True,   # 检查连接可用性
    pool_timeout=30,      # 获取连接超时
    echo=settings.DEBUG,  # 仅调试模式输出SQL
)
```

### 3.2 索引优化

**文件**: `backend/models.py`

**新增索引**:

| 表名 | 索引名 | 字段 | 用途 |
|-----|-------|------|------|
| users | idx_user_username_role | username, role | 管理员查询 |
| orders | idx_order_user_status | user_id, status | 用户订单筛选 |
| orders | idx_order_status_created | status, created_at | 订单统计 |
| novels | idx_novel_user_genre | user_id, genre | 用户+题材查询 |
| novels | idx_novel_user_status | user_id, status | 用户小说筛选 |
| novels | idx_novel_genre_created | genre, created_at | 题材排序 |
| chapters | idx_chapter_novel_number | novel_id, chapter_number | 章节查询 |
| generation_tasks | idx_task_user_status | user_id, status | 任务列表 |

### 3.3 PostgreSQL配置

**文件**: `backend/postgresql.conf`

**关键配置**:
```ini
# 内存配置 (4G内存)
shared_buffers = 1GB          # 内存的1/4
work_mem = 32MB               # 单个查询内存
maintenance_work_mem = 128MB  # 维护操作内存
effective_cache_size = 3GB    # 查询优化器估算

# 连接配置
max_connections = 50          # 匹配SQLAlchemy连接池

# 并行查询 (2核CPU)
max_worker_processes = 2
max_parallel_workers_per_gather = 1
max_parallel_workers = 2

# 日志配置
log_min_messages = warning    # 减少日志输出
statement_timeout = 30000     # 30秒查询超时
```

**应用配置**:
```bash
# 复制配置文件到PostgreSQL数据目录
cp backend/postgresql.conf /var/lib/pgsql/data/

# 重启PostgreSQL
sudo systemctl restart postgresql
```

---

## 4. 新增数据模型

### 4.1 API配置表 (APIConfig)
存储各AI模型的API密钥配置

### 4.2 提示词模板表 (PromptTemplate)
存储可配置的提示词模板，支持后台可视化编辑

### 4.3 系统配置表 (SystemConfig)
存储系统级配置项

---

## 5. 部署步骤

### 5.1 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 5.2 配置环境变量

创建 `.env` 文件:
```env
ENV=production
DATABASE_URL=postgresql://postgres:password@localhost:5432/novel_generator
SECRET_KEY=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5.3 启动Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5.4 启动后端服务

**开发模式** (单进程):
```bash
python start_backend.py
```

**生产模式** (Gunicorn多进程):
```bash
python start_gunicorn.py
```

### 5.5 验证优化效果

**检查数据库连接池**:
```python
from database import db_manager
print(db_manager.get_pool_status())
```

**检查Redis缓存**:
```python
from cache import cache_manager
print(f"Redis状态: {'已启用' if cache_manager.enabled else '未启用'}")
```

---

## 6. 性能监控

### 6.1 系统资源监控

```bash
# CPU和内存
htop

# 数据库连接
ps aux | grep postgres

# Redis连接
redis-cli info clients
```

### 6.2 应用性能监控

**数据库连接池状态**:
```python
from database import db_manager
status = db_manager.get_pool_status()
print(f"连接池大小: {status['size']}")
print(f"已检出: {status['checked_out']}")
print(f"可用: {status['checked_in']}")
```

**缓存命中率**:
```python
from cache import cache_manager
# 缓存命中情况会在日志中输出
```

---

## 7. 故障排查

### 7.1 Redis连接失败

**现象**: 应用启动时提示 "Redis连接失败"
**解决**:
1. 检查Redis服务是否运行: `redis-cli ping`
2. 检查配置文件中的Redis地址和端口
3. 应用会自动降级为无缓存模式，不影响核心功能

### 7.2 数据库连接池耗尽

**现象**: 请求超时，日志显示连接池错误
**解决**:
1. 检查连接池配置是否匹配PostgreSQL的max_connections
2. 检查是否有连接未正确关闭
3. 临时增加max_overflow值

### 7.3 Gunicorn Worker被kill

**现象**: Worker进程频繁重启
**解决**:
1. 检查timeout设置是否足够（AI调用需要较长时间）
2. 检查服务器内存是否充足
3. 调整worker数量

---

## 8. 进一步优化建议

### 8.1 短期优化
- 启用Nginx反向代理，配置静态文件缓存
- 配置CDN加速前端资源
- 启用gzip压缩

### 8.2 中期优化
- 引入Celery处理异步任务（章节生成）
- 添加Prometheus监控
- 配置Sentry错误追踪

### 8.3 长期优化
- 数据库读写分离
- 引入消息队列解耦
- 微服务架构拆分

---

## 9. 资源占用预估

| 组件 | 内存占用 | CPU占用 | 说明 |
|-----|---------|---------|------|
| Gunicorn (3 workers) | ~1.5GB | 中等 | 主要业务逻辑 |
| PostgreSQL | ~1GB | 低-中等 | 数据存储 |
| Redis | ~100MB | 低 | 缓存服务 |
| Nginx | ~50MB | 低 | 反向代理 |
| 系统预留 | ~1GB | - | 操作系统 |
| **总计** | **~3.65GB** | **中等** | **4GB内存够用** |

---

## 10. 总结

本次优化实现了：
1. ✅ **进程优化**: Gunicorn多进程启动，适配2核CPU
2. ✅ **缓存优化**: Redis缓存高频请求，减少API调用
3. ✅ **数据库优化**: 连接池+索引优化，降低资源消耗
4. ✅ **容错机制**: 优雅降级，单点故障不影响整体
5. ✅ **生产就绪**: 调试模式控制，日志级别优化

**预期效果**:
- 并发处理能力提升 3-5倍
- API调用成本降低 30-50%（缓存命中）
- 数据库查询性能提升 50%+
- 系统稳定性显著提升
