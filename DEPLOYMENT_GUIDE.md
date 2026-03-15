# 码字成书 - 腾讯云服务器部署指南

## 服务器配置评估

你的配置：2核CPU + 4GB内存 + 6Mbps带宽 + 60GB硬盘

| 资源 | 需求 | 状态 | 说明 |
|--------|------|------|------|
| CPU | 2核 | ✅ 充足 | Python + FastAPI 轻量级应用 |
| 内存 | 4GB | ✅ 充足 | Python运行 + 网站访问绰绰有余 |
| 带宽 | 6Mbps | ✅ 充足 | 个人使用完全足够 |
| 硬盘 | 60GB | ✅ 充足 | 项目文件很小，剩余空间很多 |

**结论：完全可以部署！**

---

## 部署架构

```
┌─────────────────────────────────────┐
│         腾讯云服务器          │
│  ┌───────────────────────────┐  │
│  │  Nginx (端口80/443)  │  │
│  │  ┌───────────────────┐  │  │
│  │  │  FastAPI (8000) │  │  │
│  │  └───────────────────┘  │  │
│  │  ┌───────────────────┐  │  │
│  │  │  静态文件 (3001) │  │  │
│  │  └───────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 部署步骤

### 1. 服务器环境准备

#### 1.1 更新系统
```bash
# CentOS/RHEL
sudo yum update -y

# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
```

#### 1.2 安装Python 3.9+
```bash
# CentOS/RHEL
sudo yum install python3 python3-pip -y

# Ubuntu/Debian
sudo apt install python3 python3-pip -y

# 验证版本
python3 --version
```

#### 1.2 安装Nginx
```bash
# CentOS/RHEL
sudo yum install nginx -y

# Ubuntu/Debian
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### 2. 上传项目文件

#### 2.1 使用SCP上传
```bash
# 在本地执行
scp -r novel-generator root@你的服务器IP:/root/
```

#### 2.2 使用SFTP上传
- 工具：FileZilla、WinSCP
- 地址：你的服务器IP
- 端口：22
- 用户：root
- 密码：你的服务器密码

---

### 3. 安装Python依赖

```bash
cd /root/novel-generator

# 安装后端依赖
pip3 install fastapi uvicorn

# 或者使用requirements.txt
pip3 install -r requirements.txt
```

---

### 4. 配置后端服务

#### 4.1 创建systemd服务文件
```bash
sudo nano /etc/systemd/system/novel-backend.service
```

#### 4.2 服务配置内容
```ini
[Unit]
Description=码字成书后端服务
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/novel-generator
ExecStart=/usr/bin/python3 /root/novel-generator/start_backend.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 4.3 启动后端服务
```bash
# 重新加载systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start novel-backend

# 设置开机自启
sudo systemctl enable novel-backend

# 查看状态
sudo systemctl status novel-backend
```

---

### 5. 配置Nginx

#### 5.1 创建Nginx配置文件
```bash
sudo nano /etc/nginx/conf.d/novel-generator.conf
```

#### 5.2 Nginx配置内容
```nginx
# 后端API代理
server {
    listen 80;
    server_name 你的域名.com;  # 替换为你的域名或IP

    # 后端API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端静态文件
    location / {
        root /root/novel-generator/preview;
        index dashboard.html home.html;
        try_files $uri $uri/ /dashboard.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        root /root/novel-generator/preview;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 5.3 测试并重启Nginx
```bash
# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

### 6. 配置防火墙

#### 6.1 开放必要端口
```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# Ubuntu (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw reload
```

#### 6.2 腾讯云安全组配置
在腾讯云控制台：
1. 进入"安全组"设置
2. 添加入站规则：
   - 端口：80，协议：TCP，来源：0.0.0.0/0
   - 端口：443，协议：TCP，来源：0.0.0.0/0
   - 端口：8000，协议：TCP，来源：0.0.0.0/0（可选，如果需要直接访问API）

---

### 7. 配置域名（可选）

#### 7.1 域名解析
在域名服务商（如阿里云、腾讯云）：
- 记录类型：A
- 主机记录：@ 或 www
- 记录值：你的服务器公网IP

#### 7.2 SSL证书（HTTPS）
```bash
# 使用Let's Encrypt免费证书
sudo yum install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d 你的域名.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 验证部署

### 8.1 检查服务状态
```bash
# 检查后端
sudo systemctl status novel-backend

# 检查Nginx
sudo systemctl status nginx

# 检查端口
netstat -tlnp | grep -E ':(80|443|8000)'
```

### 8.2 访问测试
```
前端页面：
http://你的域名.com/
http://你的域名.com/dashboard.html
http://你的域名.com/home.html

后端API：
http://你的域名.com/api/
http://你的域名.com/api/health
```

---

## 性能优化建议

### 9.1 使用Gunicorn（生产环境）
```bash
# 安装Gunicorn
pip3 install gunicorn

# 创建Gunicorn配置
nano gunicorn_config.py

# 配置内容
bind = "127.0.0.1:8000"
workers = 2  # 对应CPU核心数
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5

# 启动Gunicorn
gunicorn -c gunicorn_config.py start_backend:app
```

### 9.2 启用Nginx缓存
```nginx
# 在nginx配置中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    # ... 其他配置 ...

    location /api/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        # ... 其他配置 ...
    }
}
```

---

## 监控和日志

### 10.1 查看日志
```bash
# 后端日志
sudo journalctl -u novel-backend -f

# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 10.2 设置日志轮转
```bash
sudo nano /etc/logrotate.d/novel-generator

# 内容
/root/novel-generator/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 root root
}
```

---

## 常见问题

### Q1: 端口被占用
```bash
# 查看占用端口的进程
sudo netstat -tlnp | grep :8000

# 杀死进程
sudo kill -9 <PID>
```

### Q2: 权限问题
```bash
# 设置正确的文件权限
sudo chown -R root:root /root/novel-generator
sudo chmod -R 755 /root/novel-generator
```

### Q3: 502 Bad Gateway
- 检查后端服务是否运行
- 检查防火墙是否开放8000端口
- 检查Nginx配置是否正确

### Q4: 403 Forbidden
- 检查文件权限
- 检查SELinux状态（CentOS）
```bash
sudo setenforce 0  # 临时关闭
```

---

## 备份策略

### 11.1 自动备份脚本
```bash
#!/bin/bash
# /root/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
SOURCE_DIR="/root/novel-generator"

mkdir -p $BACKUP_DIR

# 备份项目文件
tar -czf $BACKUP_DIR/novel-generator_$DATE.tar.gz $SOURCE_DIR

# 删除7天前的备份
find $BACKUP_DIR -name "novel-generator_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 11.2 设置定时备份
```bash
# 添加到crontab
crontab -e

# 每天凌晨3点备份
0 3 * * * /root/backup.sh >> /var/log/backup.log 2>&1
```

---

## 成本估算

### 腾讯云服务器费用（参考）
- 2核4GB：约 ¥100-200/月
- 6Mbps带宽：包含在基础费用中
- 60GB硬盘：包含在基础费用中

### 其他费用
- 域名：约 ¥50-100/年
- SSL证书：免费（Let's Encrypt）
- CDN（可选）：按流量计费

**总计：约 ¥150-300/月**

---

## 总结

✅ **可以部署！你的服务器配置完全满足需求**

**优势：**
- 配置充足，性能良好
- 成本合理，适合个人使用
- 可以承载数百并发用户

**建议：**
1. 先在本地测试完整功能
2. 使用Gunicorn替代Uvicorn（生产环境）
3. 配置SSL证书（HTTPS）
4. 设置自动备份
5. 定期监控服务状态

**下一步：**
1. 购买服务器（如果还没买）
2. 按照本指南逐步部署
3. 测试所有功能
4. 配置域名和SSL
5. 上线使用

需要帮助部署？随时告诉我！
