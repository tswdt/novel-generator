# 码字成书 - GitHub上传指南

## 项目已准备好上传到GitHub

✅ **已完成：**
- Git仓库初始化
- .gitignore文件创建
- 所有文件已添加到Git
- 首次提交完成（45个文件，8703行代码）

---

## 方法1：使用GitHub CLI（推荐）

### 1.1 安装GitHub CLI
```bash
# Windows
winget install --id GitHub.cli GitHub.CLI

# 验证安装
gh --version
```

### 1.2 登录GitHub
```bash
gh auth login
```

### 1.3 创建仓库并推送
```bash
cd "c:\Users\Administrator\Desktop\新建文件夹\novel-generator"

# 创建仓库（会自动推送）
gh repo create novel-generator --public --source=. --remote=origin
```

---

## 方法2：手动创建仓库

### 2.1 在GitHub创建仓库

1. 访问 https://github.com/new
2. 填写信息：
   - Repository name: `novel-generator`
   - Description: `码字成书 - AI驱动的小说创作平台`
   - Public: ✅ 公开仓库
   - Initialize: ❌ 不初始化（我们已经有Git了）
3. 点击"Create repository"

### 2.2 推送到GitHub

```bash
cd "c:\Users\Administrator\Desktop\新建文件夹\novel-generator"

# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/novel-generator.git

# 推送到GitHub
git push -u origin master
```

---

## 方法3：使用GitHub Desktop（图形界面）

### 3.1 下载并安装
1. 访问 https://desktop.github.com/
2. 下载并安装GitHub Desktop

### 3.2 推送项目
1. 打开GitHub Desktop
2. 点击"File" → "Add Local Repository"
3. 选择项目文件夹：`c:\Users\Administrator\Desktop\新建文件夹\novel-generator`
4. 点击"Create Repository"
5. 在GitHub网页上创建仓库（同方法2.1）
6. 点击"Publish repository"

---

## 项目结构

```
novel-generator/
├── backend/              # 后端API服务
│   ├── main.py          # FastAPI主应用
│   ├── ai_service.py    # AI服务集成
│   ├── config.py         # 配置管理
│   ├── database.py       # 数据库操作
│   ├── models.py         # 数据模型
│   ├── prompts.py        # AI提示词管理
│   ├── routes/           # API路由
│   │   ├── auth.py       # 认证路由
│   │   ├── novels.py     # 小说路由
│   │   └── payment.py    # 支付路由
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile       # Docker配置
├── frontend/             # 前端应用（Next.js）
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── payment/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── page.tsx
│   │   └── contexts/
│   │       └── AuthContext.tsx
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── preview/              # 静态HTML预览
│   ├── dashboard.html    # 工作台页面
│   ├── home.html        # 首页
│   ├── config.html      # 配置页面
│   ├── login.html       # 登录页面
│   └── test.html        # 测试页面
├── docs/                # 文档
│   ├── DEPLOYMENT.md      # 部署指南
│   ├── PAGE_PREVIEW.md    # 页面预览
│   ├── PROJECT_SUMMARY.md  # 项目总结
│   └── QUICK_START.md     # 快速开始
├── simple_server.py      # 简化服务器
├── start_server.py       # 前端服务器
├── start_backend.py      # 后端服务器
├── start_frontend.py     # 前端服务器（自动打开浏览器）
├── 启动所有服务.py      # 一键启动脚本
├── 启动服务.bat        # Windows批处理
├── .gitignore           # Git忽略文件
└── README.md            # 项目说明
```

---

## 技术栈

### 后端
- **框架**: FastAPI
- **服务器**: Uvicorn
- **数据库**: SQLite
- **AI集成**: DeepSeek, Doubao, Kimi

### 前端
- **框架**: Next.js 14
- **UI库**: Tailwind CSS
- **状态管理**: React Context
- **路由**: App Router

### 部署
- **容器**: Docker
- **反向代理**: Nginx
- **服务器**: 腾讯云（推荐配置）

---

## 功能特性

### 核心功能
- ✅ AI驱动的小说创作
- ✅ 多模型支持（DeepSeek, Doubao, Kimi）
- ✅ 步骤化生成流程
- ✅ 可视化提示词管理
- ✅ 支付系统
- ✅ 用户认证

### 前端功能
- ✅ 响应式设计
- ✅ 现代化UI
- ✅ 实时预览
- ✅ 频道选择（男频/女频）
- ✅ 题材标签云
- ✅ 更多设置折叠面板

---

## 快速开始

### 本地运行
```bash
# 启动所有服务
python 启动所有服务.py

# 或分别启动
python start_backend.py    # 后端
python start_frontend.py   # 前端
```

### 访问地址
- **工作台**: http://localhost:3001/dashboard.html
- **首页**: http://localhost:3001/home.html
- **配置**: http://localhost:3001/config.html
- **后端API**: http://localhost:8000

---

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 许可证

本项目采用 MIT 许可证

---

## 联系方式

- 项目地址: https://github.com/YOUR_USERNAME/novel-generator
- 问题反馈: 请创建Issue

---

## 致谢

感谢所有为本项目做出贡献的开发者！

---

**下一步：选择上述任一方法将项目上传到GitHub！**
