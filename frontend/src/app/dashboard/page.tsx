'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Layout, Button, Card, List, Modal, Form, Input, Select, message, Spin, Tag, Space, Typography } from 'antd';
import { PlusOutlined, BookOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { novelsAPI } from '@/lib/api';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// 懒加载非首屏组件，减少首屏加载体积
const NovelPreview = dynamic(() => import('@/components/NovelPreview'), {
  loading: () => <Card><Spin tip="加载预览组件..." /></Card>,
  ssr: false  // 客户端渲染，减少服务端压力
});

const AIGenerationPanel = dynamic(() => import('@/components/AIGenerationPanel'), {
  loading: () => <Card><Spin tip="加载AI组件..." /></Card>,
  ssr: false
});

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
  const [showAIPanel, setShowAIPanel] = useState(false);
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
    // 选择小说时显示AI面板
    setShowAIPanel(true);
  };

  const handleViewChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setChapterModalVisible(true);
  };

  const handleGenerationComplete = (data: any) => {
    if (selectedNovel) {
      fetchChapters(selectedNovel.id);
      fetchNovels();
    }
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

  // 计算生成进度
  const calculateProgress = () => {
    if (!selectedNovel || selectedNovel.total_chapters === 0) return 0;
    return Math.round((selectedNovel.generated_chapters / selectedNovel.total_chapters) * 100);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <BookOutlined /> 码字成书
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
                  title={novel.title}
                  description={
                    <Space direction="vertical" size={0}>
                      <Tag size="small">{novel.genre}</Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {novel.generated_chapters}/{novel.total_chapters}章
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          {selectedNovel ? (
            <>
              <Card
                title={selectedNovel.title}
                extra={
                  <Space>
                    <Tag color={selectedNovel.status === 'completed' ? 'success' : 'processing'}>
                      {selectedNovel.status === 'completed' ? '已完成' : '生成中'}
                    </Tag>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => handleGenerateOutline(selectedNovel.id)}
                      loading={loading}
                    >
                      重新生成大纲
                    </Button>
                    <Button 
                      icon={<DeleteOutlined />} 
                      danger 
                      onClick={() => handleDeleteNovel(selectedNovel.id)}
                    >
                      删除
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>简介：</Text>
                  <Text>{selectedNovel.description}</Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>字数：</Text>
                  <Text>{selectedNovel.word_count.toLocaleString()}</Text>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>章节：</Text>
                  <Text>{selectedNovel.generated_chapters}/{selectedNovel.total_chapters}</Text>
                </div>

                {outline && (
                  <div style={{ marginTop: '16px' }}>
                    <Text strong>大纲：</Text>
                    <div style={{ 
                      background: '#f6ffed', 
                      padding: '16px', 
                      borderRadius: '8px',
                      marginTop: '8px',
                      maxHeight: '300px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {outline}
                    </div>
                  </div>
                )}
              </Card>

              {/* 懒加载的AI生成面板 */}
              {showAIPanel && (
                <AIGenerationPanel 
                  novelId={selectedNovel.id.toString()}
                  onGenerationComplete={handleGenerationComplete}
                />
              )}

              {/* 懒加载的小说预览组件 */}
              {showAIPanel && (
                <NovelPreview 
                  novelId={selectedNovel.id.toString()}
                  title={selectedNovel.title}
                  genre={selectedNovel.genre}
                  description={selectedNovel.description}
                  progress={calculateProgress()}
                />
              )}

              <Card title="章节列表" style={{ marginTop: '16px' }}>
                <List
                  dataSource={chapters}
                  renderItem={(chapter) => (
                    <List.Item
                      actions={[
                        <Button 
                          key="view" 
                          icon={<EyeOutlined />}
                          onClick={() => handleViewChapter(chapter)}
                        >
                          查看
                        </Button>,
                        <Button
                          key="regenerate"
                          icon={<ReloadOutlined />}
                          onClick={() => handleGenerateChapter(selectedNovel.id, chapter.chapter_number, '')}
                          loading={loading}
                        >
                          重新生成
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={`第${chapter.chapter_number}章 ${chapter.title}`}
                        description={`${chapter.word_count}字 · ${new Date(chapter.created_at).toLocaleString()}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
              <p style={{ marginTop: '16px', color: '#999' }}>请选择或创建一部小说</p>
            </div>
          )}
        </Content>
      </Layout>

      {/* 创建小说弹窗 */}
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
            label="题材"
            rules={[{ required: true, message: '请选择题材' }]}
          >
            <Select options={genreOptions} placeholder="请选择题材" />
          </Form.Item>
          <Form.Item
            name="description"
            label="简介"
            rules={[{ required: true, message: '请输入简介' }]}
          >
            <TextArea rows={4} placeholder="请输入简介" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看章节弹窗 */}
      <Modal
        title={selectedChapter?.title}
        open={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        width={800}
        footer={null}
      >
        <div style={{ 
          background: '#f6ffed', 
          padding: '16px', 
          borderRadius: '8px',
          maxHeight: '500px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.8'
        }}>
          {selectedChapter?.content}
        </div>
      </Modal>
    </Layout>
  );
}
