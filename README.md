# 码字成书

AI驱动的智能小说创作平台，支持生成符合番茄小说平台规范的原创小说内容。

## 功能特性

- AI智能生成小说大纲、章节细纲和完整正文
- 支持9大热门题材（男频爽文、女频言情、悬疑推理等）
- 严格遵守平台内容规范，自动规避违规风险
- 用户认证和权限管理
- 付费充值系统
- 章节管理和预览

## 技术栈

### 后端
- Python 3.9+
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT认证
- 大语言模型API（智谱AI、通义千问等）

### 前端
- Next.js 14
- React 18
- TypeScript
- Ant Design
- Axios

## 项目结构

```
novel-generator/
├── backend/                 # 后端服务
│   ├── routes/             # API路由
│   ├── models.py           # 数据库模型
│   ├── database.py         # 数据库连接
│   ├── ai_service.py       # AI服务
│   ├── config.py           # 配置文件
│   ├── main.py             # 应用入口
│   └── requirements.txt    # Python依赖
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── app/           # 页面组件
│   │   ├── components/    # 公共组件
│   │   ├── lib/           # 工具库
│   │   └── contexts/      # React Context
│   ├── package.json       # Node依赖
│   └── next.config.js     # Next.js配置
└── docs/                  # 文档
```

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 后端部署

1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填入真实的配置信息
```

3. 初始化数据库
```bash
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

4. 启动服务
```bash
python main.py
# 或使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端部署

1. 安装依赖
```bash
cd frontend
npm install
```

2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑.env.local文件，设置API地址
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
npm start
```

## API文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看Swagger API文档。

## 配置说明

### 后端配置 (.env)

- `DATABASE_URL`: PostgreSQL数据库连接字符串
- `SECRET_KEY`: JWT密钥
- `AI_MODEL_API_KEY`: AI模型API密钥
- `AI_MODEL_API_URL`: AI模型API地址
- `AI_MODEL_NAME`: AI模型名称（zhipu/qwen）
- `REDIS_URL`: Redis连接字符串
- `PAYMENT_API_KEY`: 支付API密钥
- `PAYMENT_SECRET`: 支付API密钥

### 前端配置 (.env.local)

- `NEXT_PUBLIC_API_URL`: 后端API地址

## 支付集成

项目预留了支付接口，需要集成微信支付或支付宝支付SDK：

1. 在 `backend/routes/payment.py` 中实现真实的支付回调逻辑
2. 在 `frontend/src/app/payment/page.tsx` 中集成支付SDK
3. 替换模拟支付流程为真实支付流程

## AI模型配置

项目支持多种AI模型：

### 智谱AI
```python
AI_MODEL_NAME=zhipu
AI_MODEL_API_KEY=your-zhipu-api-key
AI_MODEL_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 通义千问
```python
AI_MODEL_NAME=qwen
AI_MODEL_API_KEY=your-qwen-api-key
AI_MODEL_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

## 数据库表结构

- users: 用户表
- orders: 订单表
- novels: 小说表
- chapters: 章节表
- generation_tasks: 生成任务表

## 开发指南

### 添加新的小说题材

1. 在 `frontend/src/app/dashboard/page.tsx` 中添加新的题材选项
2. 在 `backend/ai_service.py` 中更新提示词模板
3. 更新小说创作规范文档

### 自定义AI提示词

编辑 `backend/ai_service.py` 中的 `generate_novel_outline` 和 `generate_chapter` 方法。

## 部署建议

### 使用Docker部署

1. 构建后端镜像
```bash
cd backend
docker build -t novel-generator-backend .
```

2. 构建前端镜像
```bash
cd frontend
docker build -t novel-generator-frontend .
```

3. 使用Docker Compose编排
```bash
docker-compose up -d
```

### 使用云服务部署

- 后端：可以部署到阿里云、腾讯云等云服务器
- 前端：可以部署到Vercel、Netlify等平台
- 数据库：使用云数据库服务（如RDS）

## 注意事项

1. 生产环境务必修改 `SECRET_KEY` 和数据库密码
2. 配置HTTPS证书保障数据传输安全
3. 定期备份数据库
4. 监控API调用次数和费用
5. 实现限流和防刷机制

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系开发者。
