import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, Layout, message, Row, Select, Space, Switch, Tabs, Typography } from "antd";
import { apiClient, type AppConfig } from "../api";
import { defaultConfig, modelOptions, workflowNodeOrder } from "../constants";

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

const providerLabelMap: Record<string, string> = {
  doubao: "豆包 Doubao",
  deepseek: "DeepSeek",
  kimi: "Kimi",
  glm: "智谱 GLM"
};

const promptStepLabelMap: Record<string, string> = {
  title: "生成书名",
  intro: "生成简介",
  world: "生成世界观",
  hero: "生成主角设定",
  characters: "生成人物设定",
  outline: "生成全卷大纲",
  detail: "生成章节细纲"
};

const ensureWorkflowNodes = (config: AppConfig): AppConfig => {
  const byKey = new Map(config.nodes.map((item) => [item.key, item]));
  const nodes = workflowNodeOrder.map((key) => {
    const existing = byKey.get(key);
    return {
      key,
      name: promptStepLabelMap[key] || existing?.name || key,
      model: existing?.model || "global",
      systemPrompt: existing?.systemPrompt || ""
    };
  });
  return {
    ...config,
    nodes
  };
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }
  return undefined;
};

export function AdminPage() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const resp = await apiClient.getAdminConfig();
        setConfig(ensureWorkflowNodes(resp.data));
      } catch {
        message.warning("读取远程配置失败，已使用本地默认配置");
      }
    };
    void bootstrap();
  }, []);

  const sortedNodes = useMemo(
    () =>
      [...config.nodes].sort(
        (a, b) => workflowNodeOrder.indexOf(a.key) - workflowNodeOrder.indexOf(b.key)
      ),
    [config.nodes]
  );

  const updateProvider = (provider: string, patch: Partial<AppConfig["llmProviders"][string]>) => {
    setConfig((prev) => ({
      ...prev,
      llmProviders: {
        ...prev.llmProviders,
        [provider]: {
          ...prev.llmProviders[provider],
          ...patch
        }
      }
    }));
  };

  const updateNode = (key: string, patch: Partial<AppConfig["nodes"][number]>) => {
    setConfig((prev) => ({
      ...prev,
      nodes: prev.nodes.some((node) => node.key === key)
        ? prev.nodes.map((node) => (node.key === key ? { ...node, ...patch } : node))
        : [...prev.nodes, { key, name: promptStepLabelMap[key] || key, model: "global", systemPrompt: "", ...patch }]
    }));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const resp = await apiClient.saveAdminConfig(ensureWorkflowNodes(config));
      message.success(resp.message || "同步成功");
    } catch {
      message.error("同步失败");
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (provider: string) => {
    try {
      const current = config.llmProviders[provider];
      const resp = await apiClient.testProvider(provider, current.apiKey, current.baseUrl);
      message.success(resp.message || "测试成功");
    } catch (error) {
      message.error(getErrorMessage(error) || "测试失败");
    }
  };

  const testImageProvider = async () => {
    try {
      const resp = await apiClient.testImageProvider(config.imageProvider.apiKey, config.imageProvider.baseUrl);
      message.success(resp.message || "测试成功");
    } catch (error) {
      message.error(getErrorMessage(error) || "测试失败");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e6eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Title level={4} style={{ color: "#1d2129", margin: 0 }}>
          管理端 /admin
        </Title>
        <Button type="primary" size="large" loading={saving} onClick={saveConfig}>
          导出/同步配置
        </Button>
      </Header>
      <Content style={{ padding: 24 }}>
        <Tabs
          items={[
            {
              key: "providers",
              label: "模型供应商配置",
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <Card>
                    <Form layout="vertical">
                      <Form.Item label="全局默认模型">
                        <Select
                          value={config.defaultModel}
                          options={modelOptions}
                          onChange={(value) => setConfig((prev) => ({ ...prev, defaultModel: value }))}
                        />
                      </Form.Item>
                    </Form>
                  </Card>
                  <Row gutter={[16, 16]}>
                    {Object.entries(config.llmProviders).map(([provider, info]) => (
                      <Col xs={24} md={12} key={provider}>
                        <Card
                          title={providerLabelMap[provider] || provider}
                          extra={
                            <Switch
                              checked={info.enabled}
                              onChange={(checked) => updateProvider(provider, { enabled: checked })}
                            />
                          }
                        >
                          <Form layout="vertical">
                            <Form.Item label="API Key">
                              <Input.Password
                                value={info.apiKey}
                                onChange={(e) => updateProvider(provider, { apiKey: e.target.value })}
                              />
                            </Form.Item>
                            <Form.Item label="Base URL（选填）">
                              <Input
                                value={info.baseUrl}
                                onChange={(e) => updateProvider(provider, { baseUrl: e.target.value })}
                              />
                            </Form.Item>
                            <Button onClick={() => void testProvider(provider)}>测试连接</Button>
                          </Form>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <Card title="AI 绘图配置">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={8}>
                        <Text>启用绘图</Text>
                        <div style={{ marginTop: 8 }}>
                          <Switch
                            checked={config.imageProvider.enabled}
                            onChange={(checked) =>
                              setConfig((prev) => ({ ...prev, imageProvider: { ...prev.imageProvider, enabled: checked } }))
                            }
                          />
                        </div>
                      </Col>
                      <Col xs={24} md={8}>
                        <Text>API Key</Text>
                        <Input.Password
                          style={{ marginTop: 8 }}
                          value={config.imageProvider.apiKey}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, imageProvider: { ...prev.imageProvider, apiKey: e.target.value } }))
                          }
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Text>Base URL（选填）</Text>
                        <Input
                          style={{ marginTop: 8 }}
                          value={config.imageProvider.baseUrl}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, imageProvider: { ...prev.imageProvider, baseUrl: e.target.value } }))
                          }
                        />
                      </Col>
                    </Row>
                    <Button style={{ marginTop: 16 }} onClick={() => void testImageProvider()}>
                      测试绘图服务
                    </Button>
                  </Card>
                </Space>
              )
            },
            {
              key: "workflow",
              label: "提示词配置（1-7步）",
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="步骤提示词配置">
                      <Space direction="vertical" style={{ width: "100%" }} size={12}>
                        {sortedNodes.map((node, index) => (
                          <Card key={node.key} size="small" title={`步骤 ${index + 1}：${promptStepLabelMap[node.key] || node.name}`}>
                            <Form layout="vertical">
                              <Form.Item label="步骤模型">
                                <Select
                                  value={node.model}
                                  options={[{ label: "跟随全局默认", value: "global" }, ...modelOptions]}
                                  onChange={(value) => updateNode(node.key, { model: value })}
                                />
                              </Form.Item>
                              <Form.Item label="System Prompt">
                                <TextArea
                                  value={node.systemPrompt}
                                  onChange={(e) => updateNode(node.key, { systemPrompt: e.target.value })}
                                  autoSize={{ minRows: 5, maxRows: 10 }}
                                  placeholder={`请输入“${promptStepLabelMap[node.key] || node.name}”阶段的提示词`}
                                />
                              </Form.Item>
                            </Form>
                          </Card>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Content>
    </Layout>
  );
}
