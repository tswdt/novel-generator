# 部署说明（Nginx + Node.js，低配服务器）

## 服务器建议

- CPU：2核
- 内存：4GB
- 磁盘：60GB
- 带宽：6Mbps

## 一、部署后端

```bash
cd /opt/novel-generator/project/server
npm install --omit=dev
node index.js
```

建议使用 `pm2` 或 `systemd` 托管进程。

## 二、构建前端

```bash
cd /opt/novel-generator/project/client
npm install
npm run build
```

构建产物在 `client/dist`，可直接由 Nginx 托管。

## 三、Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/novel-generator/project/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 四、配置文件

后端运行后会自动生成：

`project/server/data/config.json`

你也可以把管理端导出的配置文件直接放到该目录。

## 五、第三方 API 网络要求

- 服务器需允许访问对应模型与绘图 API 域名（出网放行）
- 管理端填写 API Key 后，建议先执行“测试连接”
- 当第三方接口不可用时，系统会自动回退 Mock 结果，不会阻断主流程
