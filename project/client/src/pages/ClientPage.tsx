import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Layout,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  message
} from "antd";
import {
  BulbOutlined,
  CheckCircleFilled,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  MoonFilled,
  RedoOutlined,
  UserOutlined
} from "@ant-design/icons";
import { apiClient, type GenerateForm, type StepResult } from "../api";

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

const genreOptions = [
  {
    value: "男频",
    label: "男频",
    children: [
      { value: "西方奇幻", label: "西方奇幻" },
      { value: "东方仙侠", label: "东方仙侠" },
      { value: "科幻末世", label: "科幻末世" },
      { value: "都市日常", label: "都市日常" },
      { value: "都市修真", label: "都市修真" },
      { value: "都市高武", label: "都市高武" },
      { value: "历史古代", label: "历史古代" },
      { value: "战神赘婿", label: "战神赘婿" },
      { value: "都市种田", label: "都市种田" },
      { value: "传统玄幻", label: "传统玄幻" },
      { value: "历史脑洞", label: "历史脑洞" },
      { value: "悬疑脑洞", label: "悬疑脑洞" },
      { value: "都市脑洞", label: "都市脑洞" },
      { value: "玄幻脑洞", label: "玄幻脑洞" },
      { value: "悬疑灵异", label: "悬疑灵异" },
      { value: "抗战谍战", label: "抗战谍战" },
      { value: "游戏体育", label: "游戏体育" },
      { value: "动漫衍生", label: "动漫衍生" },
      { value: "男频衍生", label: "男频衍生" }
    ]
  },
  {
    value: "女频",
    label: "女频",
    children: [
      { value: "古风世情", label: "古风世情" },
      { value: "科幻末世", label: "科幻末世" },
      { value: "游戏体育", label: "游戏体育" },
      { value: "女频衍生", label: "女频衍生" },
      { value: "玄幻言情", label: "玄幻言情" },
      { value: "种田", label: "种田" },
      { value: "年代", label: "年代" },
      { value: "现言脑洞", label: "现言脑洞" },
      { value: "宫斗宅斗", label: "宫斗宅斗" },
      { value: "悬疑脑洞", label: "悬疑脑洞" },
      { value: "古言脑洞", label: "古言脑洞" },
      { value: "快穿", label: "快穿" },
      { value: "青春甜宠", label: "青春甜宠" },
      { value: "星光璀璨", label: "星光璀璨" },
      { value: "女频悬疑", label: "女频悬疑" },
      { value: "职场婚恋", label: "职场婚恋" },
      { value: "豪门总裁", label: "豪门总裁" },
      { value: "民国言情", label: "民国言情" }
    ]
  }
];

const workflowStepDefinitions = [
  { key: "title", label: "生成书名", display: "生成书名" },
  { key: "intro", label: "生成简介", display: "生成简介" },
  { key: "world", label: "生成世界观", display: "生成世界观" },
  { key: "hero", label: "生成主角设定", display: "生成主角设定" },
  { key: "characters", label: "生成人物设定", display: "生成人物设定" },
  { key: "outline", label: "生成全卷大纲", display: "生成全卷大纲" },
  { key: "detail", label: "生成章节细纲", display: "生成章节细纲" }
] as const;

type Stage = "form" | "workflow";
type SelectOne = string | string[] | undefined;

interface WizardFormValues {
  channel?: string;
  genrePath?: string[];
  maleGenres?: string[];
  femaleGenres?: string[];
  perspective?: string;
  words?: SelectOne;
  volumes?: SelectOne;
  chaptersPerVolume?: SelectOne;
  title?: string;
  summary?: string;
}

export function ClientPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = window.localStorage.getItem("novel-theme");
    return saved === "dark" ? "dark" : "light";
  });
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [formData, setFormData] = useState<GenerateForm | null>(null);
  const [steps, setSteps] = useState<StepResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [focusedStep, setFocusedStep] = useState<StepResult | null>(null);
  const [workflowErrorKey, setWorkflowErrorKey] = useState<string | null>(null);
  const [workflowCancelled, setWorkflowCancelled] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverStyle, setCoverStyle] = useState("玄幻");
  const [coverPrompt, setCoverPrompt] = useState("");
  const [covers, setCovers] = useState<string[]>([]);
  const [activeReportTab, setActiveReportTab] = useState("report-merged");
  const [reportReady, setReportReady] = useState(false);
  const [singleChapterPrompt, setSingleChapterPrompt] = useState("");
  const [singleChapterContent, setSingleChapterContent] = useState("");
  const [singleChapterLoading, setSingleChapterLoading] = useState(false);
  const [form] = Form.useForm<WizardFormValues>();
  const channel = Form.useWatch("channel", form);
  const genrePath = Form.useWatch("genrePath", form);
  const maleGenres = Form.useWatch("maleGenres", form);
  const femaleGenres = Form.useWatch("femaleGenres", form);
  const perspective = Form.useWatch("perspective", form);
  const title = Form.useWatch("title", form);
  const summary = Form.useWatch("summary", form);

  const wordOptions = ["100000", "300000", "500000", "1000000", "2000000"].map((value) => ({
    label: `${Number(value).toLocaleString()} 字`,
    value
  }));
  const volumeOptions = ["2", "3", "4", "5", "6"].map((value) => ({ label: `${value} 卷`, value }));
  const chapterOptions = ["20", "30", "50", "100", "200"].map((value) => ({ label: `${value} 章`, value }));

  useEffect(() => {
    window.localStorage.setItem("novel-theme", theme);
  }, [theme]);

  useEffect(() => {
    const selectedMale = Array.isArray(maleGenres) ? maleGenres : [];
    const selectedFemale = Array.isArray(femaleGenres) ? femaleGenres : [];
    const mergedGenres = [
      ...(selectedMale.map((item) => `男频:${item}`) || []),
      ...(selectedFemale.map((item) => `女频:${item}`) || [])
    ];
    form.setFieldValue("genrePath", mergedGenres.length ? mergedGenres : undefined);
  }, [femaleGenres, form, maleGenres]);

  useEffect(() => {
    if (stage !== "workflow") {
      return;
    }
    if (workflowCancelled || workflowErrorKey) {
      return;
    }
    if (progress < steps.length) {
      const timer = window.setTimeout(() => setProgress((prev) => prev + 1), 900);
      return () => window.clearTimeout(timer);
    }
  }, [progress, stage, steps.length, workflowCancelled, workflowErrorKey]);

  useEffect(() => {
    if (stage !== "workflow" || steps.length === 0) {
      return;
    }
    const index = Math.min(progress, steps.length - 1);
    if (!focusedStep || !steps.some((step) => step.key === focusedStep.key)) {
      setFocusedStep(steps[index]);
    }
  }, [focusedStep, progress, stage, steps]);

  const mergedResult = useMemo(
    () => steps.map((item) => `【${item.name}】\n${item.content}`).join("\n\n"),
    [steps]
  );

  const workflowKeyIndex = useMemo(
    () => Object.fromEntries(workflowStepDefinitions.map((item, index) => [item.key, index])) as Record<string, number>,
    []
  );

  const stepKeyIndex = useMemo(() => Object.fromEntries(steps.map((item, index) => [item.key, index])) as Record<string, number>, [steps]);
  const detailStepIndex = stepKeyIndex.detail ?? -1;
  const detailCompleted = detailStepIndex >= 0 && progress > detailStepIndex;

  const isWorkflowDone = stage === "workflow" && steps.length > 0 && progress >= steps.length && !workflowErrorKey && !workflowCancelled;

  const maleGenreOptions = useMemo(() => genreOptions.find((item) => item.value === "男频")?.children || [], []);
  const femaleGenreOptions = useMemo(() => genreOptions.find((item) => item.value === "女频")?.children || [], []);
  const crossGenreOptions = useMemo(
    () => [
      {
        label: "男频题材",
        options: maleGenreOptions.map((item) => ({ label: item.label, value: item.value }))
      },
      {
        label: "女频题材",
        options: femaleGenreOptions.map((item) => ({ label: item.label, value: item.value }))
      }
    ],
    [femaleGenreOptions, maleGenreOptions]
  );

  const toSingleValue = (value: SelectOne) => {
    if (Array.isArray(value)) {
      return value.length ? value[value.length - 1] : undefined;
    }
    return value;
  };

  const toNumberOrUndefined = (value: SelectOne) => {
    const raw = toSingleValue(value);
    if (!raw) {
      return undefined;
    }
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  };

  const onSelectChannel = (value: "男频" | "女频") => {
    form.setFieldsValue({
      channel: value
    });
  };

  const onPickGenreByChannel = (targetChannel: "男频" | "女频", values: string[]) => {
    form.setFieldsValue({
      channel: targetChannel,
      [targetChannel === "男频" ? "maleGenres" : "femaleGenres"]: values
    });
  };

  const numberValidator = async (_: unknown, value: SelectOne) => {
    if (!value) {
      return Promise.resolve();
    }
    const raw = toSingleValue(value);
    if (!raw) {
      return Promise.resolve();
    }
    if (!/^\d+$/.test(String(raw))) {
      return Promise.reject(new Error("请输入数字"));
    }
    return Promise.resolve();
  };

  const stepOneReady = Boolean(channel && genrePath?.length && perspective);
  const stepTwoReady = Boolean(title?.trim() && summary?.trim());
  const maleGenreValue = Array.isArray(maleGenres) ? maleGenres : [];
  const femaleGenreValue = Array.isArray(femaleGenres) ? femaleGenres : [];

  const handleGenerate = async () => {
    const values = await form.validateFields();
    setLoadingGenerate(true);
    try {
      const payload = {
        channel: values.channel,
        genrePath: values.genrePath || [],
        perspective: values.perspective || "",
        words: toNumberOrUndefined(values.words),
        volumes: toNumberOrUndefined(values.volumes),
        chaptersPerVolume: toNumberOrUndefined(values.chaptersPerVolume),
        title: values.title || "",
        summary: values.summary || ""
      } as unknown as GenerateForm;
      const resp = await apiClient.generateNovel(payload);
      const generatedSteps = resp.data.steps as StepResult[];
      setFormData(payload);
      setSteps(generatedSteps);
      setProgress(0);
      setFocusedStep(generatedSteps.find((step) => step.key !== "start") || generatedSteps[0] || null);
      setWorkflowErrorKey(null);
      setWorkflowCancelled(false);
      setActiveReportTab("report-merged");
      setReportReady(false);
      setSingleChapterContent("");
      setSingleChapterPrompt("");
      setCoverPrompt(generatedSteps.find((step) => step.key === "intro")?.content || (values.summary || ""));
      setStage("workflow");
    } catch {
      message.error("创作失败，请稍后再试");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!formData) {
      return;
    }
    setCoverLoading(true);
    try {
      const resp = await apiClient.generateCover(formData.title, coverStyle, coverPrompt);
      const urls = (resp.data.images || []).map((item: { url: string }) => item.url);
      setCovers(urls);
      message.success("封面生成完成");
    } catch {
      message.error("封面生成失败");
    } finally {
      setCoverLoading(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `novel-cover-${index + 1}.png`;
    link.click();
  };

  const exportAll = () => {
    const head = formData
      ? `书名：${formData.title}\n题材：${formData.genrePath.join(" / ")}\n视角：${formData.perspective}\n目标字数：${formData.words}\n分卷：${formData.volumes}\n梗概：${formData.summary}\n`
      : "";
    const text = `${head}\n${mergedResult}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData?.title || "AI小说全案"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelWorkflow = () => {
    setWorkflowCancelled(true);
    message.warning("已取消当前生成流程");
  };

  const handleBackToFormWithKeepData = () => {
    setStage("form");
    setWorkflowCancelled(false);
    setWorkflowErrorKey(null);
    setReportReady(false);
    setFocusedStep(null);
    setProgress(0);
  };

  const handleRetryFromError = () => {
    if (!workflowErrorKey) {
      return;
    }
    const retryIndex = workflowStepDefinitions.findIndex((item) => item.key === workflowErrorKey);
    setWorkflowErrorKey(null);
    setWorkflowCancelled(false);
    setProgress(Math.max(retryIndex, 0));
  };

  const handleGenerateSingleChapter = async () => {
    if (!formData) {
      return;
    }
    setSingleChapterLoading(true);
    try {
      const seed =
        singleChapterPrompt.trim() ||
        currentDisplayStep?.content?.slice(0, 180) ||
        formData.summary ||
        "主角在危机中做出关键选择。";
      const output = [
        `《${formData.title}》单章正文`,
        "",
        `【章节主题】${seed}`,
        "",
        `${formData.title}的夜色像一层压低的幕布，街巷里风声很轻，却把每一寸沉默都放大。`,
        `他沿着记忆中的路径前行，脚步不快，心跳却在关键节点一点点收紧。`,
        `当所有线索在同一刻汇聚，他终于看清真相并做出抉择——这一步，将改变后续所有人的命运。`,
        "",
        "（可继续点击生成，快速产出下一版正文）"
      ].join("\n");
      setSingleChapterContent(output);
      message.success("单章正文已生成");
    } finally {
      setSingleChapterLoading(false);
    }
  };

  const workflowStatusText = useMemo(() => {
    const activeKey = steps[Math.min(progress, Math.max(steps.length - 1, 0))]?.key;
    const activeLabelMap: Record<string, string> = {
      start: "生成书名",
      title: "生成书名",
      intro: "生成简介",
      world: "生成世界观",
      hero: "生成主角设定",
      characters: "生成人物设定",
      outline: "生成全卷大纲",
      detail: "生成章节细纲",
      end: "生成全案报告"
    };
    if (workflowErrorKey) {
      return `执行失败：${activeLabelMap[workflowErrorKey] || "未知步骤"}`;
    }
    if (workflowCancelled) {
      return "流程已取消";
    }
    if (isWorkflowDone) {
      return "生成全案报告已就绪";
    }
    if (activeKey === "start") {
      return "正在执行：第 1 步 生成书名";
    }
    const idx = workflowKeyIndex[activeKey || "title"] ?? 0;
    const current = workflowStepDefinitions[idx];
    return `正在执行：第 ${idx + 1} 步 ${current?.label || "处理中"}`;
  }, [isWorkflowDone, progress, steps, workflowCancelled, workflowErrorKey, workflowKeyIndex]);

  const currentDisplayStep = useMemo(() => {
    if (focusedStep) {
      return focusedStep;
    }
    if (!steps.length) {
      return null;
    }
    const active = steps[Math.min(progress, steps.length - 1)];
    if (active?.key === "start") {
      return steps.find((item) => item.key === "title") || active;
    }
    return active;
  }, [focusedStep, progress, steps]);

  const workflowRunning = stage === "workflow" && !workflowCancelled && !workflowErrorKey && progress < steps.length;
  const canStartGenerate = Boolean(stepOneReady && stepTwoReady && !loadingGenerate);
  const hasWorkflowData = steps.length > 0;

  return (
    <Layout className={`client-shell ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      <Header className="top-nav">
        <div className="brand-area">
          <div className="brand-mark">LX</div>
          <EditOutlined className="brand-icon" />
          <div>
            <Title level={4} className="brand-title">
              灵感小说工作台
            </Title>
            <Text className="brand-sub">只做一件事：AI 生成小说全案</Text>
          </div>
        </div>
        <Space size={14}>
          <Text className="theme-label">{theme === "dark" ? "深色模式" : "浅色模式"}</Text>
          <Switch
            checked={theme === "dark"}
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<BulbOutlined />}
            onChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Avatar icon={<UserOutlined />} size={34} />
        </Space>
      </Header>

      <Content className="content-wrap workspace-page">
        <Form layout="vertical" form={form}>
          <Form.Item name="channel" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="genrePath" hidden rules={[{ required: true, message: "请选择题材类型" }]}>
            <Select mode="multiple" options={[]} />
          </Form.Item>
          <Form.Item name="maleGenres" hidden>
            <Select mode="multiple" options={[]} />
          </Form.Item>
          <Form.Item name="femaleGenres" hidden>
            <Select mode="multiple" options={[]} />
          </Form.Item>

          <div className="workspace-grid">
            <Card className="workspace-panel left-panel">
              <div className="panel-head compact">
                <Title level={4} className="panel-title">创作配置</Title>
                <Text>左侧配置，启动全流程</Text>
              </div>

              <div className="channel-grid">
                <button type="button" className={`channel-box ${channel === "男频" ? "active" : ""}`} onClick={() => onSelectChannel("男频")}>
                  男频
                </button>
                <button type="button" className={`channel-box ${channel === "女频" ? "active" : ""}`} onClick={() => onSelectChannel("女频")}>
                  女频
                </button>
              </div>

              <Row gutter={16} className="step-row">
                <Col xs={24} md={12}>
                  <div className="channel-genre-block">
                    <span className="field-label">男频题材<span className="required-star">*</span></span>
                    <Select
                      value={maleGenreValue}
                      mode="multiple"
                      options={crossGenreOptions}
                      placeholder="男频可跨选题材"
                      onChange={(value) => onPickGenreByChannel("男频", value)}
                      showSearch
                      optionFilterProp="label"
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="channel-genre-block">
                    <span className="field-label">女频题材<span className="required-star">*</span></span>
                    <Select
                      value={femaleGenreValue}
                      mode="multiple"
                      options={crossGenreOptions}
                      placeholder="女频可跨选题材"
                      onChange={(value) => onPickGenreByChannel("女频", value)}
                      showSearch
                      optionFilterProp="label"
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="step-row">
                <Col span={24}>
                  <Form.Item
                    label={<span className="field-label">叙述视角<span className="required-star">*</span></span>}
                    name="perspective"
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[{ required: true, message: "请选择叙述视角" }]}
                  >
                    <Select
                      placeholder="请选择 / 输入"
                      options={[
                        { label: "第一人称", value: "第一人称" },
                        { label: "第三人称", value: "第三人称" }
                      ]}
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label={<span className="field-label">目标总字数</span>}
                    name="words"
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[{ validator: numberValidator }]}
                    extra={<span className="field-hint">若不选择，将以官方默认配置为准。</span>}
                  >
                    <Select
                      placeholder="请选择 / 输入"
                      allowClear
                      showSearch
                      mode="tags"
                      maxCount={1}
                      options={wordOptions}
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label={<span className="field-label">分卷数量</span>}
                    name="volumes"
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[{ validator: numberValidator }]}
                    extra={<span className="field-hint">若不选择，将以官方默认配置为准。</span>}
                  >
                    <Select
                      placeholder="请选择 / 输入"
                      allowClear
                      showSearch
                      mode="tags"
                      maxCount={1}
                      options={volumeOptions}
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label={<span className="field-label">单卷章节数量</span>}
                    name="chaptersPerVolume"
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[{ validator: numberValidator }]}
                    extra={<span className="field-hint">若不选择，将以官方默认配置为准。</span>}
                  >
                    <Select
                      placeholder="请选择 / 输入"
                      allowClear
                      showSearch
                      mode="tags"
                      maxCount={1}
                      options={chapterOptions}
                      suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={<span className="field-label">书名 / 核心创意<span className="required-star">*</span></span>}
                name="title"
                validateTrigger={["onChange", "onBlur"]}
                rules={[{ required: true, message: "请输入书名 / 核心创意" }]}
              >
                <Input placeholder="例如：被流放后我在边境建神国" />
              </Form.Item>

              <Form.Item
                label={<span className="field-label">剧情梗概<span className="required-star">*</span></span>}
                name="summary"
                validateTrigger={["onChange", "onBlur"]}
                rules={[{ required: true, message: "请输入剧情梗概" }]}
              >
                <TextArea autoSize={{ minRows: 5, maxRows: 8 }} placeholder="请输入剧情梗概" />
              </Form.Item>

              <div className="workspace-left-actions">
                <Button type="primary" className="start-btn" loading={loadingGenerate} onClick={() => void handleGenerate()} disabled={!canStartGenerate}>
                  开始 AI 创作
                </Button>
                <Button className="back-btn" onClick={handleBackToFormWithKeepData}>
                  重置工作区
                </Button>
              </div>
            </Card>

            <Card className="workspace-panel middle-panel">
              <div className="panel-head compact">
                <Title level={4} className="panel-title">工作流</Title>
                <Text>{workflowStatusText}</Text>
              </div>

              <div className="flow-cards">
                {workflowStepDefinitions.map((item, index) => {
                  let status: "pending" | "running" | "completed" | "error" = "pending";
                  if (workflowErrorKey) {
                    if (item.key === workflowErrorKey) {
                      status = "error";
                    } else if ((stepKeyIndex[item.key] ?? -1) >= 0 && (stepKeyIndex[item.key] ?? -1) < (stepKeyIndex[workflowErrorKey] ?? 999)) {
                      status = "completed";
                    }
                  } else {
                    const stepIndex = stepKeyIndex[item.key] ?? -1;
                    if (stepIndex >= 0 && (isWorkflowDone || progress > stepIndex)) {
                      status = "completed";
                    } else if (stepIndex >= 0 && workflowRunning && progress === stepIndex) {
                      status = "running";
                    }
                  }

                  const generatedStep = steps.find((step) => step.key === item.key);
                  const summaryText = generatedStep?.content?.slice(0, 78) || "";

                  return (
                    <button
                      type="button"
                      key={item.key}
                      className={`flow-node-card ${status} ${generatedStep ? "clickable" : ""}`}
                      onClick={() => {
                        if (generatedStep) {
                          setFocusedStep(generatedStep);
                        }
                      }}
                    >
                      <div className="flow-node-head">
                        <span className={`flow-index ${status}`}>
                          {status === "completed" ? <CheckCircleFilled /> : status === "running" ? <LoadingOutlined /> : status === "error" ? <ExclamationCircleFilled /> : index + 1}
                        </span>
                        <span className="flow-title">{item.display}</span>
                      </div>
                      <div className="flow-meta">
                        <span className={`flow-status ${status}`}>
                          {status === "running" ? "执行中" : status === "completed" ? "已完成" : status === "error" ? "异常" : "待执行"}
                        </span>
                        {summaryText ? <span className="flow-summary">{summaryText}</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                type={detailCompleted ? "primary" : "default"}
                className={detailCompleted ? "start-btn" : "back-btn"}
                disabled={!detailCompleted}
                onClick={() => {
                  setReportReady(true);
                  setActiveReportTab("report-merged");
                }}
              >
                {reportReady ? "全案报告已生成" : "生成全案报告"}
              </Button>

              <div className="workflow-action-row workspace-middle-actions">
                {workflowErrorKey ? (
                  <Button type="primary" icon={<RedoOutlined />} className="start-btn" onClick={handleRetryFromError}>
                    重试
                  </Button>
                ) : null}
                {!workflowErrorKey && workflowRunning ? (
                  <Button className="back-btn" onClick={handleCancelWorkflow}>
                    取消生成
                  </Button>
                ) : null}
                {isWorkflowDone ? (
                  <>
                    <Button className="back-btn" onClick={handleBackToFormWithKeepData}>
                      重新生成
                    </Button>
                    <Button type="primary" icon={<DownloadOutlined />} className="start-btn" onClick={exportAll}>
                      导出全部内容
                    </Button>
                  </>
                ) : null}
                {workflowCancelled ? (
                  <Button type="primary" className="start-btn" onClick={() => setWorkflowCancelled(false)}>
                    恢复流程
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card className="workspace-panel right-panel">
              <div className="panel-head compact">
                <Title level={4} className="panel-title">报告区</Title>
                <Text>{currentDisplayStep ? currentDisplayStep.name : "暂无报告"}</Text>
              </div>

              <Tabs
                className="report-tabs"
                activeKey={activeReportTab}
                onChange={setActiveReportTab}
                items={[
                  {
                    key: "report-merged",
                    label: "全案报告",
                    children: <div className="workflow-content-body">{hasWorkflowData && reportReady ? mergedResult : ""}</div>
                  },
                  {
                    key: "report-single",
                    label: "单章正文生成",
                    children: (
                      <div className="report-cover-pane">
                        <Text>章节主题</Text>
                        <TextArea
                          style={{ marginTop: 8 }}
                          value={singleChapterPrompt}
                          onChange={(e) => setSingleChapterPrompt(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 5 }}
                          placeholder="输入本章主题、冲突或关键事件"
                        />
                        <Button style={{ marginTop: 12 }} type="primary" loading={singleChapterLoading} onClick={() => void handleGenerateSingleChapter()}>
                          生成单章正文
                        </Button>
                        <div className="workflow-content-body" style={{ marginTop: 12 }}>{singleChapterContent}</div>
                      </div>
                    )
                  },
                  {
                    key: "report-cover",
                    label: "封面",
                    children: (
                      <div className="report-cover-pane">
                        <Text>风格</Text>
                        <Select
                          style={{ width: "100%", marginTop: 8, marginBottom: 12 }}
                          value={coverStyle}
                          onChange={setCoverStyle}
                          options={[
                            { label: "玄幻", value: "玄幻" },
                            { label: "都市", value: "都市" },
                            { label: "古言", value: "古言" },
                            { label: "悬疑", value: "悬疑" },
                            { label: "科幻", value: "科幻" }
                          ]}
                          suffixIcon={<DownOutlined style={{ fontSize: 14 }} />}
                        />
                        <Text>描述</Text>
                        <TextArea
                          style={{ marginTop: 8 }}
                          value={coverPrompt}
                          onChange={(e) => setCoverPrompt(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                        <Button style={{ marginTop: 12 }} type="primary" loading={coverLoading} onClick={() => void handleGenerateCover()}>
                          生成封面
                        </Button>
                        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                          {covers.map((url, index) => (
                            <Col xs={24} sm={12} key={url}>
                              <Card
                                cover={<Image src={url} alt={`cover-${index + 1}`} preview={false} />}
                                actions={[
                                  <Button type="link" icon={<DownloadOutlined />} onClick={() => downloadImage(url, index)}>
                                    下载
                                  </Button>
                                ]}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </div>
        </Form>
      </Content>
    </Layout>
  );
}
