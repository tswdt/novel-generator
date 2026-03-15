'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Table, Modal, Form, Input, message, Space, Typography, Statistic, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { paymentAPI } from '@/lib/api';

const { Header, Content } = Layout;
const { Title } = Typography;

interface Order {
  id: number;
  order_no: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (values: { amount: number }) => {
    setLoading(true);
    try {
      const response = await paymentAPI.createOrder({
        amount: values.amount,
        payment_method: 'wechat'
      });
      message.success('订单创建成功');
      setRechargeModalVisible(false);
      form.resetFields();
      fetchOrders();
      
      Modal.info({
        title: '支付提示',
        content: '请在实际项目中集成微信/支付宝支付SDK',
        onOk: () => {
          paymentAPI.paymentCallback(response.data.order_no, 'mock_payment_id', 'success');
          fetchOrders();
        }
      });
    } catch (error: any) {
      message.error(error.response?.data?.detail || '充值失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待支付', color: 'orange' },
          paid: { text: '已支付', color: 'green' },
          failed: { text: '失败', color: 'red' },
          refunded: { text: '已退款', color: 'default' },
        };
        const { text, color } = statusMap[status] || { text: status, color: 'default' };
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: '支付方式',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => method === 'wechat' ? '微信支付' : method,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const rechargeOptions = [
    { value: 10, label: '¥10' },
    { value: 50, label: '¥50' },
    { value: 100, label: '¥100' },
    { value: 200, label: '¥200' },
    { value: 500, label: '¥500' },
    { value: 1000, label: '¥1000' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#001529' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          充值中心
        </div>
        <Space>
          <Button type="link" onClick={() => router.push('/dashboard')} style={{ color: 'white' }}>
            返回工作台
          </Button>
          <Button type="link" onClick={logout} style={{ color: 'white' }}>
            退出
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="账户余额"
                value={user?.balance || 0}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="累计充值"
                value={orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0)}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="订单数量"
                value={orders.length}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="充值"
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setRechargeModalVisible(true)}
            >
              立即充值
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Content>

      <Modal
        title="充值"
        open={rechargeModalVisible}
        onCancel={() => setRechargeModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRecharge} layout="vertical">
          <Form.Item
            name="amount"
            label="充值金额"
            rules={[{ required: true, message: '请选择充值金额' }]}
          >
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 100px)' }}
                placeholder="或输入自定义金额"
                type="number"
                min={1}
              />
              <Button style={{ width: '100px' }}>元</Button>
            </Input.Group>
          </Form.Item>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>快捷充值：</div>
            <Space wrap>
              {rechargeOptions.map(option => (
                <Button
                  key={option.value}
                  onClick={() => form.setFieldValue('amount', option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </Space>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              确认充值
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
