# AI 小说生成工具（轻量版）

本项目是前后端分离的 Web 小说生成工具，针对 2核4G 服务器进行轻量化设计：

- 前端：React 18 + Vite + Ant Design + React Flow
- 后端：Node.js + Express
- 存储：JSON 配置文件（`server/data/config.json`）
- AI：仅调用第三方 API（支持真实调用，失败自动回退 Mock）

## 项目结构

```text
/project
  /client
  /server
  /docs
```

## 1. 启动后端

```bash
cd project/server
npm install
npm run dev
```

默认端口：`http://localhost:3000`

## 2. 启动前端

```bash
cd project/client
npm install
cp .env.example .env
npm run dev
```

默认地址：`http://localhost:5173`

## 3. 页面入口

- 用户端：`/` 或 `/client`
- 管理端：`/admin`

说明：当前是单页应用，按路径切换页面。生产环境需在 Nginx 配置 `try_files`，确保刷新路由不会 404。

## 4. 管理端配置流程

1. 打开 `/admin`
2. 配置模型 API Key、Base URL、默认模型、节点 Prompt、绘图配置
3. 点击“导出/同步配置”
4. 后端将配置写入 `server/data/config.json`

## 5. 用户端创作流程

1. 填写题材、视角、字数、分卷、书名、剧情梗概
2. 点击“开始创作”
3. 展示工作流动画并按节点顺序执行
4. 查看汇总结果并可生成封面图

## 6. 第三方 API 接入说明

- 文本模型配置在管理端 `/admin` 的「模型供应商配置」
- 每个节点可选择跟随全局默认模型或指定模型
- `Base URL` 可不填，不填时后端使用内置默认地址

默认模型地址与模型名：

- doubao：`https://ark.cn-beijing.volces.com/api/v3/chat/completions`，`doubao-1-5-pro-32k-250115`
- deepseek：`https://api.deepseek.com/chat/completions`，`deepseek-chat`
- kimi：`https://api.moonshot.cn/v1/chat/completions`，`moonshot-v1-8k`
- glm：`https://open.bigmodel.cn/api/paas/v4/chat/completions`，`glm-4-flash`

绘图接口：

- 管理端启用「AI 绘图配置」后，后端会调用真实绘图 API
- 绘图 Base URL 不填时默认使用 `https://api.openai.com/v1/images/generations`
- 若调用失败会自动回退为 Base64 SVG 占位图，确保前端始终可用

当前核心接口行为：

- `POST /api/admin/test-provider`：真实调用模型做连通性测试
- `POST /api/admin/test-image-provider`：真实调用绘图服务测试
- `POST /api/generate`：优先真实调用，失败按节点回退 Mock 文本
- `POST /api/generate-cover`：优先真实绘图，失败回退 Base64 SVG
