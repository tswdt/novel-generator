'use client';

import React, { useState } from 'react';
import { Card, Steps, Button, message, Spin } from 'antd';
import { 
  FileTextOutlined, 
  ProfileOutlined, 
  GlobalOutlined, 
  UserOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  BookOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Step } = Steps;

/**
 * AI生成面板组件
 * 懒加载，减少首屏加载体积
 */
interface AIGenerationPanelProps {
  novelId?: string;
  onGenerationComplete?: (data: any) => void;
}

const generationSteps = [
  { title: '书名建议', icon: <FileTextOutlined />, key: 'title' },
  { title: '爆款简介', icon: <ProfileOutlined />, key: 'description' },
  { title: '世界观设定', icon: <GlobalOutlined />, key: 'world' },
  { title: '主角设定', icon: <UserOutlined />, key: 'protagonist' },
  { title: '主要人物', icon: <TeamOutlined />, key: 'characters' },
  { title: '全书大纲', icon: <UnorderedListOutlined />, key: 'outline' },
  { title: '分卷细纲', icon: <BookOutlined />, key: 'volume' },
];

const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({
  novelId,
  onGenerationComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (currentStep >= generationSteps.length) {
      message.success('所有步骤已完成！');
      return;
    }

    setGenerating(true);
    
    // 模拟AI生成
    setTimeout(() => {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
      setGenerating(false);
      
      if (currentStep === generationSteps.length - 1) {
        message.success('小说大纲生成完成！');
        onGenerationComplete?.({ success: true });
      }
    }, 2000);
  };

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <Card
      title="AI智能生成"
      style={{ marginTop: 16 }}
    >
      <Steps
        current={currentStep}
        direction="vertical"
        size="small"
        onChange={handleStepClick}
        style={{ marginBottom: 24 }}
      >
        {generationSteps.map((step, index) => (
          <Step
            key={step.key}
            title={step.title}
            icon={completedSteps.includes(index) ? <CheckCircleOutlined /> : step.icon}
            description={
              index === currentStep && generating ? (
                <Spin size="small" tip="生成中..." />
              ) : completedSteps.includes(index) ? (
                <span style={{ color: '#52c41a' }}>已完成</span>
              ) : null
            }
          />
        ))}
      </Steps>

      <Button
        type="primary"
        onClick={handleGenerate}
        loading={generating}
        disabled={currentStep >= generationSteps.length}
        block
      >
        {currentStep >= generationSteps.length 
          ? '生成完成' 
          : `开始生成: ${generationSteps[currentStep]?.title}`}
      </Button>
    </Card>
  );
};

export default AIGenerationPanel;
