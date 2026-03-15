'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Card, List, Modal, Form, Input, Select, message, Spin, Tag, Space, Typography } from 'antd';
import { PlusOutlined, BookOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { novelsAPI } from '@/lib/api';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Novel {
  id: number;
  title: string;
  description: string;
  genre: string;
  status: string;
  total_chapters: number;
  generated_chapters: number;
  word_count: number;
  created_at: string;
}

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [outline, setOutline] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchNovels();
  }, [user, router]);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const response = await novelsAPI.getNovels();
      setNovels(response.data);
    } catch (error) {
      message.error('获取小说列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (novelId: number) => {
    setLoading(true);
    try {
      const response = await novelsAPI.getChapters(novelId);
      setChapters(response.data);
    } catch (error) {
      message.error('获取章节列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNovel = async (values: any) => {
    setLoading(true);
    try {
      const response = await novelsAPI.createNovel(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchNovels();
    } catch (error: any) {
      message.error(error.response?.data?.detail || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutline = async (novelId: number) => {
    setLoading(true);
    try {
      const response = await novelsAPI.generateOutline(novelId);
      setOutline(response.data.outline);
      message.success('生成大纲成功');
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async (novelId: number, chapterNumber: number, chapterOutline: string) => {
    setLoading(true);
    try {
      await novelsAPI.generateChapter(novelId, chapterNumber, chapterOutline);
      message.success('生成章节成功');
      fetchChapters(novelId);
      fetchNovels();
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNovel = async (novelId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这部小说吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await novelsAPI.deleteNovel(novelId);
          message.success('删除成功');
          if (selectedNovel?.id === novelId) {
            setSelectedNovel(null);
            setChapters([]);
          }
          fetchNovels();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSelectNovel = (novel: Novel) => {
    setSelectedNovel(novel);
    fetchChapters(novel.id);
  };

  const handleViewChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setChapterModalVisible(true);
  };

  const genreOptions = [
    { value: '男频爽文', label: '男频爽文' },
    { value: '女频言情', label: '女频言情' },
    { value: '悬疑推理', label: '悬疑推理' },
    { value: '规则怪谈', label: '规则怪谈' },
    { value: '历史小说', label: '历史小说' },
    { value: '都市现实', label: '都市现实' },
    { value: '科幻奇幻', label: '科幻奇幻' },
    { value: '玄学年代', label: '玄学年代' },
    { value: '鉴宝神医', label: '鉴宝神医' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <BookOutlined /> 番茄小说生成器
        </div>
        <Space>
          <span style={{ color: 'white' }}>余额: ¥{user?.balance.toFixed(2)}</span>
          <Button type="link" onClick={() => router.push('/payment')}>充值</Button>
          <Button type="link" onClick={logout} style={{ color: 'white' }}>退出</Button>
        </Space>
      </Header>

      <Layout>
        <Sider width={300} style={{ background: '#fff' }}>
          <div style={{ padding: '16px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              block 
              onClick={() => setCreateModalVisible(true)}
            >
              创建新小说
            </Button>
          </div>
          <List
            dataSource={novels}
            renderItem={(novel) => (
              <List.Item
                style={{ 
                  cursor: 'pointer',
                  background: selectedNovel?.id === novel.id ? '#e6f7ff' : 'transparent'
                }}
                onClick={() => handleSelectNovel(novel)}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{novel.title}</Text>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNovel(novel.id);
                        }}
                      />
                    </div>
                  }
                  description={
                    <div>
                      <Tag color="blue">{novel.genre}</Tag>
                      <Tag color={novel.status === 'completed' ? 'green' : 'orange'}>
                        {novel.status === 'completed' ? '已完成' : '生成中'}
                      </Tag>
                      <br />
                      <Text type="secondary">
                        {novel.generated_chapters}/{novel.total_chapters}章 · {novel.word_count}字
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          {selectedNovel ? (
            <div>
              <Card 
                title={selectedNovel.title}
                extra={
                  <Space>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => handleGenerateOutline(selectedNovel.id)}
                      loading={loading}
                    >
                      生成大纲
                    </Button>
                  </Space>
                }
              >
                <p>{selectedNovel.description}</p>
                {outline && (
                  <div style={{ marginTop: '16px' }}>
                    <Title level={5}>小说大纲</Title>
                    <div style={{ 
                      background: '#f5f5f5', 
                      padding: '16px', 
                      borderRadius: '4px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {outline}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="章节列表" style={{ marginTop: '16px' }}>
                <List
                  dataSource={chapters}
                  renderItem={(chapter) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => handleViewChapter(chapter)}
                        >
                          查看
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={chapter.title}
                        description={`${chapter.word_count}字 · ${new Date(chapter.created_at).toLocaleDateString()}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>

              <Card title="生成新章节" style={{ marginTop: '16px' }}>
                <Form
                  onFinish={(values) => handleGenerateChapter(selectedNovel.id, values.chapter_number, values.chapter_outline)}
                >
                  <Form.Item
                    name="chapter_number"
                    label="章节序号"
                    rules={[{ required: true, message: '请输入章节序号' }]}
                  >
                    <Input type="number" placeholder="例如：1" />
                  </Form.Item>
                  <Form.Item
                    name="chapter_outline"
                    label="章节细纲"
                    rules={[{ required: true, message: '请输入章节细纲' }]}
                  >
                    <TextArea rows={4} placeholder="请输入本章的剧情概要..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      生成章节
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                <p style={{ marginTop: '16px', color: '#999' }}>请选择或创建一部小说开始创作</p>
              </div>
            </Card>
          )}
        </Content>
      </Layout>

      <Modal
        title="创建新小说"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateNovel} layout="vertical">
          <Form.Item
            name="title"
            label="书名"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item
            name="genre"
            label="题材类型"
            rules={[{ required: true, message: '请选择题材类型' }]}
          >
            <Select options={genreOptions} placeholder="请选择题材类型" />
          </Form.Item>
          <Form.Item
            name="description"
            label="剧情概要"
            rules={[{ required: true, message: '请输入剧情概要' }]}
          >
            <TextArea rows={4} placeholder="请简要描述您的小说创意..." />
          </Form.Item>
          <Form.Item
            name="total_chapters"
            label="计划章节数"
            initialValue={20}
          >
            <Input type="number" placeholder="默认20章" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedChapter?.title}
        open={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ 
          maxHeight: '60vh', 
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: '2'
        }}>
          {selectedChapter?.content}
        </div>
      </Modal>
    </Layout>
  );
}
