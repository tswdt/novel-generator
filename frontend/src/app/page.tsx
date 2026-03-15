'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Row, Col, Typography, Space } from 'antd';
import { BookOutlined, ThunderboltOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'AI智能生成',
      description: '基于大语言模型，快速生成符合番茄小说平台规范的原创小说内容',
    },
    {
      icon: <BookOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: '全品类支持',
      description: '支持男频爽文、女频言情、悬疑推理、规则怪谈等9大热门题材',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      title: '内容合规',
      description: '严格遵守平台内容规范，自动规避违规风险，保障作品安全',
    },
    {
      icon: <RocketOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: '高效创作',
      description: '快速生成大纲、章节细纲和完整正文，大幅提升创作效率',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title style={{ color: 'white', fontSize: '48px', marginBottom: '16px' }}>
          码字成书
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '20px', marginBottom: '32px' }}>
          AI驱动的智能小说创作平台，让写作更简单
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => router.push('/register')}
            style={{ 
              height: '48px', 
              fontSize: '16px',
              background: 'white',
              color: '#667eea',
              border: 'none'
            }}
          >
            立即开始
          </Button>
          <Button 
            size="large"
            onClick={() => router.push('/login')}
            style={{ 
              height: '48px', 
              fontSize: '16px',
              background: 'transparent',
              color: 'white',
              border: '1px solid white'
            }}
          >
            登录账号
          </Button>
        </Space>
      </header>

      <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          核心功能
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
              >
                <div style={{ marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title style={{ color: 'white', marginBottom: '24px' }}>
          开始您的创作之旅
        </Title>
        <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '32px' }}>
          注册即可免费体验，让AI助您创作爆款小说
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => router.push('/register')}
          style={{ 
            height: '48px', 
            fontSize: '16px',
            background: 'white',
            color: '#667eea',
            border: 'none'
          }}
        >
          免费注册
        </Button>
      </div>

      <footer style={{ 
        background: '#001529', 
        padding: '40px 20px', 
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.65)'
      }}>
        <Text>© 2024 番茄小说生成器. All rights reserved.</Text>
      </footer>
    </div>
  );
}
