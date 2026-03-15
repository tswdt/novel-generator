# 码字成书 - 部署指南

## 本地开发环境搭建

### 1. 安装必要软件

#### Windows
- Python 3.9+: https://www.python.org/downloads/
- Node.js 18+: https://nodejs.org/
- PostgreSQL 14+: https://www.postgresql.org/download/windows/
- Redis 6+: https://redis.io/download

#### macOS
```bash
# 使用Homebrew安装
brew install python@3.9 node postgresql redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3.9 python3.9-venv nodejs postgresql redis-server
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入真实的配置信息

# 初始化数据库
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# 启动服务
python main.py
```

后端服务将在 http://localhost:8000 启动

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑.env.local文件，设置API地址

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 生产环境部署

### 方案一：使用Docker Compose（推荐）

1. 准备配置文件

```bash
# 在项目根目录创建.env文件
cp .env.example .env
```

2. 编辑.env文件，填入真实的配置：

```env
AI_MODEL_API_KEY=your-actual-api-key
AI_MODEL_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL_NAME=zhipu
```

3. 启动所有服务

```bash
docker-compose up -d
```

4. 查看日志

```bash
docker-compose logs -f
```

5. 停止服务

```bash
docker-compose down
```

### 方案二：云服务器部署

#### 后端部署（Ubuntu/CentOS）

1. 安装Python和依赖

```bash
sudo apt update
sudo apt install python3.9 python3.9-venv python3-pip postgresql redis-server nginx
```

2. 配置PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE novel_generator;
CREATE USER noveluser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE novel_generator TO noveluser;
\q
```

3. 部署后端代码

```bash
cd /opt
git clone <your-repo-url> novel-generator
cd novel-generator/backend

python3.9 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 初始化数据库
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

4. 使用Gunicorn运行

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

5. 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 前端部署（Vercel）

1. 安装Vercel CLI

```bash
npm install -g vercel
```

2. 部署

```bash
cd frontend
vercel
```

3. 配置环境变量

在Vercel控制台设置 `NEXT_PUBLIC_API_URL` 为你的后端API地址

### 方案三：使用云服务

#### 阿里云部署

1. 购买ECS服务器（建议2核4G以上）
2. 购买RDS PostgreSQL数据库
3. 购买Redis实例
4. 按照方案二的步骤部署后端
5. 前端部署到阿里云OSS+CDN

#### 腾讯云部署

1. 购买CVM服务器
2. 购买云数据库PostgreSQL
3. 购买云Redis
4. 按照方案二的步骤部署后端
5. 前端部署到腾讯云COS+CDN

## 支付集成

### 微信支付

1. 注册微信支付商户账号
2. 获取API密钥和商户号
3. 在 `backend/routes/payment.py` 中集成微信支付SDK

```python
# 安装微信支付SDK
pip install wechatpy

# 示例代码
from wechatpy import WeChatPay
from wechatpy.pay import WeChatPay

wechat_pay = WeChatPay(
    appid='your-appid',
    api_key='your-api-key',
    mch_id='your-mch-id',
    notify_url='your-notify-url'
)
```

### 支付宝支付

1. 注册支付宝开放平台账号
2. 创建应用并获取AppID
3. 下载并配置应用私钥和公钥
4. 在 `backend/routes/payment.py` 中集成支付宝SDK

```python
# 安装支付宝SDK
pip install alipay-sdk-python

# 示例代码
from alipay import AliPay

alipay = AliPay(
    appid="your-appid",
    app_notify_url="your-notify-url",
    app_private_key_string="your-private-key",
    alipay_public_key_string="alipay-public-key",
    sign_type="RSA2",
    debug=False
)
```

## 监控和日志

### 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动后端
pm2 start "python main.py" --name novel-backend

# 启动前端
cd frontend
pm2 start "npm start" --name novel-frontend

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all
```

### 使用Supervisor管理进程

```bash
# 安装Supervisor
sudo apt install supervisor

# 创建配置文件
sudo nano /etc/supervisor/conf.d/novel-generator.conf
```

配置内容：

```ini
[program:novel-backend]
command=/opt/novel-generator/backend/venv/bin/python main.py
directory=/opt/novel-generator/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/novel-backend.log

[program:novel-frontend]
command=npm start
directory=/opt/novel-generator/frontend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/novel-frontend.log
```

启动服务：

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## 备份和恢复

### 数据库备份

```bash
# 备份
pg_dump -U postgres novel_generator > backup.sql

# 恢复
psql -U postgres novel_generator < backup.sql
```

### 自动备份脚本

创建 `/opt/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres novel_generator > /opt/backups/novel_generator_$DATE.sql
find /opt/backups -name "novel_generator_*.sql" -mtime +7 -delete
```

设置定时任务：

```bash
crontab -e
# 每天凌晨2点备份
0 2 * * * /opt/backup.sh
```

## 安全加固

1. 修改默认密码
2. 配置防火墙规则
3. 启用HTTPS（使用Let's Encrypt）
4. 定期更新系统和依赖
5. 配置fail2ban防止暴力破解
6. 限制API访问频率

## 性能优化

1. 使用CDN加速静态资源
2. 启用Redis缓存
3. 配置数据库连接池
4. 使用Nginx负载均衡
5. 启用Gzip压缩
6. 优化数据库查询

## 故障排查

### 后端无法启动

1. 检查端口是否被占用
2. 检查数据库连接是否正常
3. 查看日志文件
4. 检查环境变量配置

### 前端无法访问后端

1. 检查CORS配置
2. 检查API地址是否正确
3. 检查网络连接
4. 查看浏览器控制台错误

### AI生成失败

1. 检查API密钥是否正确
2. 检查API额度是否充足
3. 检查网络连接
4. 查看后端日志

## 联系支持

如遇到问题，请提交Issue或联系技术支持。
