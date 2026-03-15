import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
  timeout: 30000
});

export interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
}

export interface NodeConfig {
  key: string;
  name: string;
  model: string;
  systemPrompt: string;
}

export interface AppConfig {
  defaultModel: string;
  llmProviders: Record<string, ProviderConfig>;
  imageProvider: ProviderConfig;
  nodes: NodeConfig[];
}

export interface GenerateForm {
  genrePath: string[];
  perspective: string;
  words: number;
  volumes: number;
  title: string;
  summary: string;
}

export interface StepResult {
  key: string;
  name: string;
  model: string;
  systemPrompt: string;
  content: string;
}

export const apiClient = {
  getAdminConfig: async () => (await api.get("/api/admin/config")).data,
  saveAdminConfig: async (payload: AppConfig) => (await api.post("/api/admin/config", payload)).data,
  testProvider: async (provider: string, apiKey: string, baseUrl: string) =>
    (await api.post("/api/admin/test-provider", { provider, apiKey, baseUrl })).data,
  testImageProvider: async (apiKey: string, baseUrl: string) =>
    (await api.post("/api/admin/test-image-provider", { apiKey, baseUrl })).data,
  generateNovel: async (payload: GenerateForm) => (await api.post("/api/generate", payload)).data,
  generateCover: async (title: string, style: string, prompt: string) =>
    (await api.post("/api/generate-cover", { title, style, prompt })).data
};
