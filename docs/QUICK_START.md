# 码字成书 - 快速启动指南

## 🚀 5分钟快速开始

### 第一步：准备环境

确保你已经安装了以下软件：
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 第二步：启动后端

```bash
# 进入后端目录
cd novel-generator/backend

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
# 编辑.env文件，填入你的AI API密钥

# 启动服务
python main.py
```

后端将在 http://localhost:8000 启动

### 第三步：启动前端

```bash
# 打开新的终端窗口
cd novel-generator/frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑.env.local文件，设置API地址

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:3000 启动

### 第四步：访问应用

打开浏览器访问：http://localhost:3000

## 📖 使用流程

### 1. 注册账号

1. 点击首页的"立即开始"按钮
2. 填写用户名、邮箱、密码
3. 点击"注册"完成注册

### 2. 创建小说

1. 登录后进入工作台
2. 点击左侧的"创建新小说"按钮
3. 填写以下信息：
   - 书名：例如"重生之都市神医"
   - 题材类型：选择适合的题材（如"男频爽文"）
   - 剧情概要：简要描述你的创意
   - 计划章节数：默认20章
4. 点击"创建"

### 3. 生成大纲

1. 在工作台中选择刚创建的小说
2. 点击"生成大纲"按钮
3. 等待AI生成（约30-60秒）
4. 查看生成的大纲内容

### 4. 生成章节

1. 在"生成新章节"区域输入章节序号
2. 输入章节细纲（可以参考大纲中的章节细纲）
3. 点击"生成章节"按钮
4. 等待AI生成（约30-60秒）
5. 点击"查看"预览生成的章节

### 5. 充值（可选）

1. 点击顶部导航的"充值"按钮
2. 选择充值金额
3. 完成支付（演示版本为模拟支付）

## 🎯 示例创作流程

### 示例：创建一部男频爽文

#### 输入信息
```
书名：重生之都市神医
题材：男频爽文
剧情概要：被女友背叛，意外重生回到十年前，获得神医系统，从此走上人生巅峰
```

#### 生成大纲
AI将自动生成：
- 3个备选书名
- 小说简介（钩子+详细描述）
- 世界观设定
- 主角设定
- 5个主要人物
- 故事总体大纲
- 4卷剧情规划
- 前20章章节细纲
- 第一章完整正文

#### 生成章节
输入章节细纲：
```
第1章：重生觉醒
主角林凡被女友背叛，意外重生回到十年前，激活神医系统，获得新手大礼包，决定改变命运
```

AI将生成2500-3000字的完整章节正文。

## 🔧 配置说明

### 后端配置 (.env)

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/novel_generator

# JWT密钥（生产环境请修改）
SECRET_KEY=your-secret-key-change-in-production

# AI模型配置
AI_MODEL_API_KEY=your-ai-api-key
AI_MODEL_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL_NAME=zhipu

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 支付配置（可选）
PAYMENT_API_KEY=your-payment-api-key
PAYMENT_SECRET=your-payment-secret
```

### 前端配置 (.env.local)

```env
# 后端API地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤖 AI模型配置

### 使用智谱AI

1. 注册智谱AI账号：https://open.bigmodel.cn/
2. 获取API密钥
3. 在.env中配置：
```env
AI_MODEL_NAME=zhipu
AI_MODEL_API_KEY=your-zhipu-api-key
AI_MODEL_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 使用通义千问

1. 注册阿里云账号：https://dashscope.aliyuncs.com/
2. 开通通义千问服务
3. 获取API密钥
4. 在.env中配置：
```env
AI_MODEL_NAME=qwen
AI_MODEL_API_KEY=your-qwen-api-key
AI_MODEL_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

## 📊 支持的题材类型

### 男频爽文
关键词：系统、重生、逆袭、无敌、打脸、升级、神豪、赘婿、战神、签到

### 女频言情
关键词：恋爱、甜宠、总裁、王妃、穿越、古言、现言、虐恋、追妻、重生复仇

### 悬疑推理
关键词：破案、侦探、凶手、谜案、诡计、推理、真相、反转、诡案、灵异

### 规则怪谈
关键词：规则怪谈、无限流、副本、求生、诡异、规则、闯关、校园怪谈

### 历史小说
关键词：朝代、皇帝、将军、权谋、宫廷、战争、大明、大唐、三国、古代

### 都市现实
关键词：职场、创业、生活、家庭、现实、奋斗、成长、市井生活、外卖员

### 科幻奇幻
关键词：未来、星际、魔法、修仙、异界、末世、进化、机甲、宗门、修真

### 玄学年代
关键词：玄学、算命、风水、八零、九零、年代、团宠、全家宠、萌宝、锦鲤

### 鉴宝神医
关键词：鉴宝、捡漏、神医、治病、奶爸、萌娃、赛场、直播、古董、中医

## ⚠️ 常见问题

### 1. 后端启动失败

**问题**：无法连接数据库

**解决**：
```bash
# 检查PostgreSQL是否运行
# Windows:
net start postgresql-x64-14

# macOS/Linux:
brew services start postgresql
```

### 2. 前端无法访问后端

**问题**：CORS错误或连接超时

**解决**：
- 检查后端是否正常运行（访问 http://localhost:8000/docs）
- 检查.env.local中的API地址是否正确
- 检查后端的CORS配置

### 3. AI生成失败

**问题**：生成超时或返回错误

**解决**：
- 检查API密钥是否正确
- 检查API额度是否充足
- 检查网络连接是否正常
- 查看后端日志获取详细错误信息

### 4. 端口被占用

**问题**：端口8000或3000已被占用

**解决**：
```bash
# Windows: 查找并关闭占用端口的进程
netstat -ano | findstr :8000
taskkill /PID <进程ID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

## 🎨 自定义开发

### 修改AI提示词

编辑 `backend/ai_service.py` 文件：

```python
# 修改大纲生成提示词
prompt = f"""你是一位专业的网文创作助手...
# 在这里添加你的自定义要求
"""

# 修改章节生成提示词
prompt = f"""你是一位专业的网文创作助手...
# 在这里添加你的自定义要求
"""
```

### 添加新的题材

1. 在 `frontend/src/app/dashboard/page.tsx` 中添加选项：
```typescript
const genreOptions = [
  // ... 现有选项
  { value: '新题材', label: '新题材' },
];
```

2. 在 `backend/ai_service.py` 中添加对应的提示词逻辑

### 自定义页面样式

修改 `frontend/src/app/` 下的页面组件，使用Ant Design的样式系统

## 📚 更多资源

- API文档：http://localhost:8000/docs
- 部署指南：docs/DEPLOYMENT.md
- 项目总结：docs/PROJECT_SUMMARY.md
- 页面预览：docs/PAGE_PREVIEW.md

## 🆘 获取帮助

如果遇到问题：
1. 查看本文档的常见问题部分
2. 查看部署文档
3. 检查后端日志
4. 提交Issue

## 🎉 开始创作

现在你已经准备好了！访问 http://localhost:3000 开始你的AI小说创作之旅吧！

---

**祝创作愉快！** 🎊
