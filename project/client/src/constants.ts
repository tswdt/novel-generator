import type { AppConfig } from "./api";

export const modelOptions = [
  { label: "豆包 Doubao", value: "doubao" },
  { label: "DeepSeek", value: "deepseek" },
  { label: "Kimi", value: "kimi" },
  { label: "智谱 GLM", value: "glm" }
];

export const workflowNodeOrder = ["title", "intro", "world", "hero", "characters", "outline", "detail"];

export const defaultConfig: AppConfig = {
  defaultModel: "doubao",
  llmProviders: {
    doubao: { enabled: true, apiKey: "", baseUrl: "" },
    deepseek: { enabled: true, apiKey: "", baseUrl: "" },
    kimi: { enabled: true, apiKey: "", baseUrl: "" },
    glm: { enabled: true, apiKey: "", baseUrl: "" }
  },
  imageProvider: { enabled: false, apiKey: "", baseUrl: "" },
  nodes: [
    { key: "title", name: "生成书名", model: "global", systemPrompt: "" },
    { key: "intro", name: "生成简介", model: "global", systemPrompt: "" },
    { key: "world", name: "生成世界观", model: "global", systemPrompt: "" },
    { key: "hero", name: "生成主角设定", model: "global", systemPrompt: "" },
    { key: "characters", name: "生成人物设定", model: "global", systemPrompt: "" },
    { key: "outline", name: "生成全卷大纲", model: "global", systemPrompt: "" },
    { key: "detail", name: "生成章节细纲", model: "global", systemPrompt: "" }
  ]
};
