import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const configPath = path.join(dataDir, "config.json");
const app = express();
const port = process.env.PORT || 3000;

const nodeOrder = ["title", "intro", "world", "hero", "characters", "outline", "detail"];
const providerDefaults = {
  doubao: {
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    model: "doubao-1-5-pro-32k-250115"
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat"
  },
  kimi: {
    baseUrl: "https://api.moonshot.cn/v1/chat/completions",
    model: "moonshot-v1-8k"
  },
  glm: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4-flash"
  }
};

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

async function ensureConfigFile() {
  try {
    await fs.access(configPath);
  } catch {
    const fallback = {
      defaultModel: "doubao",
      llmProviders: {
        doubao: { enabled: true, apiKey: "", baseUrl: "" },
        deepseek: { enabled: true, apiKey: "", baseUrl: "" },
        kimi: { enabled: true, apiKey: "", baseUrl: "" },
        glm: { enabled: true, apiKey: "", baseUrl: "" }
      },
      imageProvider: { enabled: false, apiKey: "", baseUrl: "" },
      nodes: []
    };
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(fallback, null, 2), "utf-8");
  }
}

async function readConfig() {
  await ensureConfigFile();
  const raw = await fs.readFile(configPath, "utf-8");
  return JSON.parse(raw);
}

async function writeConfig(config) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

function getNodeText(nodeKey, form, generated) {
  const title = form.title?.trim() || "未命名作品";
  const summary = form.summary?.trim() || "暂无梗概";
  const genrePath = Array.isArray(form.genrePath) ? form.genrePath.join(" / ") : "通用";
  const perspective = form.perspective || "第三人称";
  const words = Number(form.words) || 50000;
  const volumes = Number(form.volumes) || 1;

  if (nodeKey === "title") {
    return `书名建议：\n1. 《${title}》\n2. 《${title}：逆命启程》\n最终书名：${title}`;
  }
  if (nodeKey === "intro") {
    return `简介：\n${summary}\n当主角被命运逼入绝境，他必须以非常手段重塑人生。`;
  }
  if (nodeKey === "world") {
    return `世界观：\n这是一个以“规则代价”为核心的世界，力量越强，反噬越重。城邦与宗门并立，暗线争斗持续升级。`;
  }
  if (nodeKey === "hero") {
    return `主角设定：\n姓名：林澈\n核心驱动：守护家人与自我证明\n优势：学习速度极快\n弱点：情感执念过深`;
  }
  if (nodeKey === "characters") {
    return `人物关系：\n- 女主：苏晚，智谋型搭档\n- 反派：沈烬，价值观对立\n- 导师：闻川，关键资源提供者\n- 盟友：顾宁，情报枢纽`;
  }
  if (nodeKey === "outline") {
    return `大纲：\n第一幕：失序开局\n第二幕：能力觉醒与第一次代价\n第三幕：阵营对抗升级\n第四幕：真相揭露与立场抉择\n第五幕：终局反转`;
  }
  if (nodeKey === "detail") {
    return `细纲（示例）：\n第1卷：破局（1-30章）\n第2卷：远征（31-80章）\n第3卷：夺势（81-130章）\n第4卷：终局（131-180章）`;
  }
  const merged = generated.map((item) => `${item.name}：${item.content.slice(0, 40)}...`).join("\n");
  return `创作流程阶段输出。\n作品名：《${title}》\n关键信息摘要：\n${merged}`;
}

function buildUserPrompt(form, nodeKey, generated) {
  const title = form.title?.trim() || "未命名作品";
  const summary = form.summary?.trim() || "暂无梗概";
  const genrePath = Array.isArray(form.genrePath) ? form.genrePath.join(" / ") : "通用";
  const perspective = form.perspective || "第三人称";
  const words = Number(form.words) || 50000;
  const volumes = Number(form.volumes) || 1;
  const previousText = generated.map((item) => `【${item.name}】\n${item.content}`).join("\n\n");
  return [
    `节点：${nodeKey}`,
    `题材：${genrePath}`,
    `视角：${perspective}`,
    `目标字数：${words}`,
    `分卷：${volumes}`,
    `书名：${title}`,
    `梗概：${summary}`,
    previousText ? `已生成内容：\n${previousText}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeProvider(provider) {
  return String(provider || "").toLowerCase();
}

function getProviderBaseUrl(provider, customBaseUrl) {
  const normalizeEndpoint = (value) => {
    const normalized = String(value || "").trim().replace(/\/+$/, "");
    if (!normalized) {
      return "";
    }
    if (normalized.endsWith("/chat/completions")) {
      return normalized;
    }
    if (normalized.endsWith("/v1")) {
      return `${normalized}/chat/completions`;
    }
    if (/^https?:\/\/[^/]+$/i.test(normalized)) {
      return `${normalized}/chat/completions`;
    }
    return normalized;
  };

  const input = normalizeEndpoint(customBaseUrl);
  if (input) {
    return input;
  }
  return normalizeEndpoint(providerDefaults[provider]?.baseUrl || "");
}

function getProviderModel(provider) {
  return providerDefaults[provider]?.model || "gpt-4o-mini";
}

function extractTextFromResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }
  if (Array.isArray(payload.choices) && payload.choices.length > 0) {
    const choice = payload.choices[0];
    if (choice?.message?.content && typeof choice.message.content === "string") {
      return choice.message.content;
    }
    if (Array.isArray(choice?.message?.content)) {
      const text = choice.message.content
        .map((item) => item?.text || "")
        .filter(Boolean)
        .join("\n");
      if (text) {
        return text;
      }
    }
    if (typeof choice?.text === "string") {
      return choice.text;
    }
  }
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }
  return "";
}

async function callTextProvider({ provider, apiKey, baseUrl, systemPrompt, userPrompt }) {
  const normalized = normalizeProvider(provider);
  const resolvedBaseUrl = getProviderBaseUrl(normalized, baseUrl);
  if (!resolvedBaseUrl) {
    throw new Error("未配置可用的 Base URL");
  }
  if (!apiKey) {
    throw new Error("未配置 API Key");
  }

  const response = await fetchWithTimeout(
    resolvedBaseUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: getProviderModel(normalized),
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt || "你是专业网络小说策划编辑。" },
          { role: "user", content: userPrompt }
        ]
      })
    },
    30000
  );

  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || raw || "远程接口调用失败";
    throw new Error(detail);
  }
  const content = extractTextFromResponse(payload);
  if (!content) {
    throw new Error("接口返回为空");
  }
  return content;
}

async function callImageProvider({ imageProvider, title, style, prompt, count }) {
  const apiKey = String(imageProvider?.apiKey || "").trim();
  const baseUrl = String(imageProvider?.baseUrl || "").trim() || "https://api.openai.com/v1/images/generations";
  if (!apiKey) {
    throw new Error("未配置绘图 API Key");
  }
  const mergedPrompt = [
    `${style || "通用"}风格小说封面`,
    `书名：${title || "未命名作品"}`,
    `描述：${prompt || "无"}`
  ].join("\n");
  const response = await fetchWithTimeout(
    baseUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: mergedPrompt,
        size: "1024x1024",
        n: count,
        response_format: "b64_json"
      })
    },
    45000
  );
  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || raw || "绘图接口调用失败";
    throw new Error(detail);
  }
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const urls = data
    .map((item) => {
      if (typeof item?.url === "string" && item.url) {
        return item.url;
      }
      if (typeof item?.b64_json === "string" && item.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      return "";
    })
    .filter(Boolean);
  if (!urls.length) {
    throw new Error("绘图接口未返回可用图片");
  }
  return urls;
}

function sanitizeForClient(config) {
  const safeProviders = Object.fromEntries(
    Object.entries(config.llmProviders || {}).map(([k, v]) => [
      k,
      {
        enabled: Boolean(v.enabled),
        hasKey: Boolean(v.apiKey),
        baseUrl: v.baseUrl || ""
      }
    ])
  );
  return {
    defaultModel: config.defaultModel,
    llmProviders: safeProviders,
    imageProviderEnabled: Boolean(config.imageProvider?.enabled),
    nodes: config.nodes || []
  };
}

app.get("/api/admin/config", async (_, res) => {
  try {
    const config = await readConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: "读取配置失败", error: error.message });
  }
});

app.post("/api/admin/config", async (req, res) => {
  try {
    const config = req.body;
    await writeConfig(config);
    res.json({ success: true, message: "配置已同步到 server/data/config.json" });
  } catch (error) {
    res.status(500).json({ success: false, message: "写入配置失败", error: error.message });
  }
});

app.post("/api/admin/test-provider", async (req, res) => {
  const { provider, apiKey, baseUrl } = req.body || {};
  if (!provider) {
    return res.status(400).json({ success: false, message: "缺少 provider" });
  }
  if (!apiKey) {
    return res.status(400).json({ success: false, message: "请填写 API Key" });
  }
  try {
    await callTextProvider({
      provider,
      apiKey,
      baseUrl,
      systemPrompt: "你是测试助手。",
      userPrompt: "请只回复：连接成功"
    });
    return res.json({ success: true, message: `${provider} 连接测试成功` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "连接测试失败" });
  }
});

app.post("/api/admin/test-image-provider", async (req, res) => {
  const { apiKey, baseUrl } = req.body || {};
  if (!apiKey) {
    return res.status(400).json({ success: false, message: "请填写绘图 API Key" });
  }
  try {
    await callImageProvider({
      imageProvider: { apiKey, baseUrl },
      title: "测试封面",
      style: "玄幻",
      prompt: "测试连接",
      count: 1
    });
    return res.json({ success: true, message: "绘图服务测试成功" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "绘图服务测试失败" });
  }
});

app.get("/api/public/config", async (_, res) => {
  try {
    const config = await readConfig();
    res.json({ success: true, data: sanitizeForClient(config) });
  } catch (error) {
    res.status(500).json({ success: false, message: "读取配置失败", error: error.message });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const config = await readConfig();
    const form = req.body || {};
    const nodes = (config.nodes || [])
      .filter((node) => nodeOrder.includes(node.key))
      .sort((a, b) => nodeOrder.indexOf(a.key) - nodeOrder.indexOf(b.key));
    const generated = [];

    for (const node of nodes) {
      const model = node.model === "global" ? config.defaultModel : node.model;
      const providerConfig = config?.llmProviders?.[model] || {};
      let content = "";
      try {
        if (!providerConfig.enabled) {
          throw new Error("供应商未启用");
        }
        content = await callTextProvider({
          provider: model,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
          systemPrompt: node.systemPrompt,
          userPrompt: buildUserPrompt(form, node.key, generated)
        });
      } catch {
        await delay(900);
        content = getNodeText(node.key, form, generated);
      }
      generated.push({
        key: node.key,
        name: node.name,
        model,
        systemPrompt: node.systemPrompt,
        content
      });
    }

    res.json({
      success: true,
      data: {
        runId: `run_${Date.now()}`,
        title: form.title,
        steps: generated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "生成失败", error: error.message });
  }
});

function createSvgDataUri(title, style, index) {
  const colors = {
    玄幻: ["#2b1055", "#7597de"],
    都市: ["#0f2027", "#2c5364"],
    古言: ["#5a2a27", "#d38312"],
    悬疑: ["#141e30", "#243b55"],
    科幻: ["#1d2b64", "#f8cdda"]
  };
  const pair = colors[style] || ["#1f4037", "#99f2c8"];
  const escapedTitle = String(title || "小说封面").replace(/[<>&"]/g, "");
  const escapedStyle = String(style || "通用").replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${pair[0]}"/><stop offset="100%" stop-color="${pair[1]}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="52" fill="#fff" font-family="Arial">${escapedTitle}</text><text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="34" fill="#fff" font-family="Arial">${escapedStyle} #${index + 1}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

app.post("/api/generate-cover", async (req, res) => {
  const { title, style, prompt } = req.body || {};
  let imageUrls = [];
  try {
    const config = await readConfig();
    if (config?.imageProvider?.enabled && config?.imageProvider?.apiKey) {
      imageUrls = await callImageProvider({
        imageProvider: config.imageProvider,
        title,
        style,
        prompt,
        count: 4
      });
    }
  } catch {
    imageUrls = [];
  }
  if (!imageUrls.length) {
    await delay(1200);
    imageUrls = [0, 1, 2, 3].map((i) => createSvgDataUri(title || prompt || "小说封面", style, i));
  }
  const images = imageUrls.map((url, i) => ({
    id: `${Date.now()}_${i}`,
    url
  }));
  res.json({ success: true, data: { images } });
});

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

ensureConfigFile().then(() => {
  app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
  });
});
