'use client';

import React, { useState, useEffect } from 'react';
import { Card, Spin, Empty, Typography, Tag, Progress } from 'antd';
import { BookOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface NovelPreviewProps {
  novelId?: string;
  title?: string;
  genre?: string;
  description?: string;
  progress?: number;
}

/**
 * 小说预览组件
 * 使用动态导入懒加载，减少首屏加载体积
 */
const NovelPreview: React.FC<NovelPreviewProps> = ({
  novelId,
  title = '未命名作品',
  genre = '未知题材',
  description = '暂无简介',
  progress = 0,
}) => {
  const [loading, setLoading] = useState(true);
  const [novelData, setNovelData] = useState<any>(null);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setNovelData({
        title,
        genre,
        description,
        progress,
        wordCount: 0,
        chapterCount: 0,
        lastUpdated: new Date().toLocaleString(),
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [title, genre, description, progress]);

  if (loading) {
    return (
      <Card style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </Card>
    );
  }

  if (!novelData) {
    return (
      <Card>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined />
          <span>作品预览</span>
        </div>
      }
      style={{ marginTop: 16 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          {novelData.title}
        </Title>
        <Tag color="blue">{novelData.genre}</Tag>
      </div>

      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {novelData.description}
      </Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          <FileTextOutlined style={{ marginRight: 8 }} />
          字数: {novelData.wordCount.toLocaleString()}
        </Text>
        <Text type="secondary" style={{ marginLeft: 24 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          章节: {novelData.chapterCount}
        </Text>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">生成进度</Text>
        <Progress percent={novelData.progress} status={novelData.progress === 100 ? 'success' : 'active'} />
      </div>

      <Text type="secondary" style={{ fontSize: 12 }}>
        最后更新: {novelData.lastUpdated}
      </Text>
    </Card>
  );
};

export default NovelPreview;
