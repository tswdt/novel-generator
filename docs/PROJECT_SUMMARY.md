# 码字成书 - 项目总结

## 项目概述

这是一个完整的AI驱动的小说生成付费网站，用户可以通过输入书名和剧情概要，自动生成符合番茄小说平台规范的原创小说内容。

## 核心功能

### 1. 用户系统
- 用户注册/登录
- JWT身份认证
- 用户权限管理
- 余额管理

### 2. 小说生成
- AI智能生成小说大纲
- 自动生成章节细纲
- 一键生成完整章节正文
- 支持9大热门题材
- 严格遵守平台内容规范

### 3. 小说管理
- 创建/删除小说
- 查看小说列表
- 章节管理
- 内容预览
- 进度追踪

### 4. 支付系统
- 充值功能
- 订单管理
- 余额查询
- 支付回调处理

## 技术架构

### 后端技术栈
- **框架**: FastAPI (Python 3.9+)
- **数据库**: PostgreSQL 14+
- **缓存**: Redis 6+
- **认证**: JWT
- **AI模型**: 智谱AI、通义千问
- **ORM**: SQLAlchemy

### 前端技术栈
- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **UI组件**: Ant Design 5
- **HTTP客户端**: Axios
- **状态管理**: React Context

## 项目结构

```
novel-generator/
├── backend/                          # 后端服务
│   ├── routes/                       # API路由
│   │   ├── auth.py                   # 认证相关API
│   │   ├── novels.py                 # 小说相关API
│   │   └── payment.py                # 支付相关API
│   ├── models.py                     # 数据库模型
│   ├── database.py                   # 数据库连接
│   ├── ai_service.py                 # AI服务（核心）
│   ├── config.py                     # 配置管理
│   ├── main.py                       # 应用入口
│   ├── requirements.txt              # Python依赖
│   ├── Dockerfile                    # Docker镜像
│   └── .env.example                  # 环境变量示例
├── frontend/                         # 前端应用
│   ├── src/
│   │   ├── app/                      # 页面组件
│   │   │   ├── page.tsx              # 首页
│   │   │   ├── login/                # 登录页
│   │   │   ├── register/             # 注册页
│   │   │   ├── dashboard/            # 工作台
│   │   │   └── payment/              # 充值页
│   │   ├── lib/                      # 工具库
│   │   │   └── api.ts                # API封装
│   │   └── contexts/                 # React Context
│   │       └── AuthContext.tsx       # 认证上下文
│   ├── package.json                  # Node依赖
│   ├── next.config.js                # Next.js配置
│   ├── Dockerfile                    # Docker镜像
│   └── .env.example                  # 环境变量示例
├── docs/                             # 文档
│   └── DEPLOYMENT.md                 # 部署指南
├── docker-compose.yml                # Docker编排
└── README.md                         # 项目说明
```

## 数据库设计

### 核心表结构

1. **users** - 用户表
   - id, username, email, hashed_password
   - role, balance, created_at, updated_at

2. **orders** - 订单表
   - id, user_id, order_no, amount
   - status, payment_method, payment_id
   - created_at, updated_at

3. **novels** - 小说表
   - id, user_id, title, description, genre
   - status, total_chapters, generated_chapters
   - word_count, created_at, updated_at

4. **chapters** - 章节表
   - id, novel_id, chapter_number, title
   - content, word_count
   - created_at, updated_at

5. **generation_tasks** - 生成任务表
   - id, user_id, novel_id, task_type
   - status, progress, error_message
   - created_at, completed_at

## API接口

### 认证接口
- POST /auth/register - 用户注册
- POST /auth/login - 用户登录

### 小说接口
- POST /novels/create - 创建小说
- POST /novels/{id}/generate-outline - 生成大纲
- POST /novels/{id}/generate-chapter/{num} - 生成章节
- GET /novels/ - 获取小说列表
- GET /novels/{id} - 获取小说详情
- GET /novels/{id}/chapters - 获取章节列表
- DELETE /novels/{id} - 删除小说

### 支付接口
- POST /payment/create-order - 创建订单
- GET /payment/orders - 获取订单列表
- GET /payment/balance - 获取余额

## 核心功能实现

### AI小说生成

**ai_service.py** 是项目的核心，实现了：

1. **大纲生成**
   - 根据书名、剧情、题材生成完整大纲
   - 包含9个标准模块（书名、简介、世界观、主角、人物、大纲、分卷、细纲、第一章）
   - 严格遵循番茄小说创作规范

2. **章节生成**
   - 根据章节细纲生成完整正文
   - 控制字数在2500-3000字
   - 遵守短段落排版规范
   - 确保内容合规

3. **多模型支持**
   - 智谱AI (GLM-4)
   - 通义千问
   - 可扩展其他模型

### 支持的小说题材

1. 男频爽文（系统、重生、逆袭等）
2. 女频言情（恋爱、甜宠、穿越等）
3. 悬疑推理（破案、侦探、灵异等）
4. 规则怪谈（无限流、副本求生等）
5. 历史小说（朝代、权谋、战争等）
6. 都市现实（职场、创业、生活等）
7. 科幻奇幻（未来、修仙、异界等）
8. 玄学年代（算命、八零、九零等）
9. 鉴宝神医（古董、中医、奶爸等）

## 部署方案

### 快速启动（Docker Compose）

```bash
# 1. 配置环境变量
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. 编辑配置文件，填入真实的API密钥
nano backend/.env

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 手动部署

详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 使用流程

### 用户端

1. **注册账号**
   - 访问首页，点击"立即注册"
   - 填写用户名、邮箱、密码
   - 完成注册

2. **充值**
   - 进入充值中心
   - 选择充值金额
   - 完成支付

3. **创建小说**
   - 进入工作台
   - 点击"创建新小说"
   - 填写书名、题材、剧情概要

4. **生成内容**
   - 点击"生成大纲"获取完整大纲
   - 输入章节细纲
   - 点击"生成章节"获取正文

5. **管理小说**
   - 查看已创建的小说列表
   - 预览章节内容
   - 删除不需要的小说

### 开发者端

1. **配置AI模型**
   - 在backend/.env中配置API密钥
   - 选择使用的AI模型（zhipu/qwen）

2. **集成支付**
   - 在backend/routes/payment.py中集成支付SDK
   - 在frontend/src/app/payment/page.tsx中配置支付流程

3. **自定义提示词**
   - 编辑backend/ai_service.py中的提示词模板
   - 根据需要调整生成规则

## 扩展功能建议

### 短期优化
1. 添加批量生成章节功能
2. 实现章节编辑功能
3. 添加导出功能（TXT、EPUB等）
4. 实现小说分享功能
5. 添加使用统计和数据分析

### 中期规划
1. 支持更多AI模型
2. 添加协作功能（多人共创）
3. 实现版本控制
4. 添加评论和反馈系统
5. 支持自定义模板

### 长期愿景
1. 构建小说创作社区
2. 开发移动端APP
3. 实现智能推荐
4. 添加版权保护
5. 对接出版渠道

## 注意事项

### 内容合规
- 严格遵守平台内容规范
- 自动规避违规内容
- 定期更新提示词模板

### 成本控制
- 监控API调用次数
- 设置合理的调用限制
- 优化生成策略减少成本

### 性能优化
- 使用Redis缓存
- 实现异步任务队列
- 优化数据库查询
- 使用CDN加速

### 安全防护
- 实现限流机制
- 防止SQL注入
- 加密敏感数据
- 定期备份数据

## 技术支持

如遇到问题，请：
1. 查看部署文档
2. 检查日志文件
3. 提交Issue
4. 联系技术支持

## 许可证

MIT License

## 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**项目状态**: ✅ 已完成核心功能开发，可投入使用

**最后更新**: 2026-03-15
