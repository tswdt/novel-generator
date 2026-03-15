from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Enum, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class NovelStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # 添加索引，用于按时间排序查询
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 添加联合索引：用户名+角色（用于管理员查询）
    __table_args__ = (
        Index("idx_user_username_role", "username", "role"),
    )
    
    orders = relationship("Order", back_populates="user")
    novels = relationship("Novel", back_populates="user")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # 添加索引
    order_no = Column(String(50), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)  # 添加索引，用于状态筛选
    payment_method = Column(String(50))
    payment_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # 添加索引，用于按时间排序
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 添加联合索引：用户+状态（高频查询）
    # 添加联合索引：状态+创建时间（用于订单统计）
    __table_args__ = (
        Index("idx_order_user_status", "user_id", "status"),
        Index("idx_order_status_created", "status", "created_at"),
    )
    
    user = relationship("User", back_populates="orders")

class Novel(Base):
    __tablename__ = "novels"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # 添加索引
    title = Column(String(200), nullable=False, index=True)  # 添加索引，用于搜索
    description = Column(Text)
    genre = Column(String(50), index=True)  # 添加索引，用于题材筛选
    status = Column(Enum(NovelStatus), default=NovelStatus.DRAFT, index=True)  # 添加索引
    total_chapters = Column(Integer, default=0)
    generated_chapters = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # 添加索引
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)  # 添加索引
    
    # 添加联合索引：用户+题材（高频查询维度）
    # 添加联合索引：用户+状态（用于筛选用户的小说）
    # 添加联合索引：题材+创建时间（用于按题材排序）
    __table_args__ = (
        Index("idx_novel_user_genre", "user_id", "genre"),
        Index("idx_novel_user_status", "user_id", "status"),
        Index("idx_novel_genre_created", "genre", "created_at"),
        Index("idx_novel_status_updated", "status", "updated_at"),  # 用于获取最近更新的生成中小说
    )
    
    user = relationship("User", back_populates="novels")
    chapters = relationship("Chapter", back_populates="novel", cascade="all, delete-orphan")

class Chapter(Base):
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    novel_id = Column(Integer, ForeignKey("novels.id"), nullable=False, index=True)  # 添加索引
    chapter_number = Column(Integer, nullable=False, index=True)  # 添加索引，用于章节排序
    title = Column(String(200))
    content = Column(Text)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 添加联合索引：小说ID+章节号（高频查询，获取小说的所有章节）
    # 添加唯一约束：小说ID+章节号（确保章节号唯一）
    __table_args__ = (
        Index("idx_chapter_novel_number", "novel_id", "chapter_number"),
        Index("idx_chapter_novel_created", "novel_id", "created_at"),  # 用于按时间获取章节
    )
    
    novel = relationship("Novel", back_populates="chapters")

class GenerationTask(Base):
    __tablename__ = "generation_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # 添加索引
    novel_id = Column(Integer, ForeignKey("novels.id"), nullable=False, index=True)  # 添加索引
    task_type = Column(String(50), index=True)  # 添加索引，用于任务类型筛选
    status = Column(String(50), default="pending", index=True)  # 添加索引
    progress = Column(Integer, default=0)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # 添加索引
    completed_at = Column(DateTime)
    
    # 添加联合索引：用户+状态（获取用户的任务列表）
    # 添加联合索引：小说+状态（获取小说的生成任务）
    # 添加联合索引：状态+创建时间（获取待处理任务队列）
    __table_args__ = (
        Index("idx_task_user_status", "user_id", "status"),
        Index("idx_task_novel_status", "novel_id", "status"),
        Index("idx_task_status_created", "status", "created_at"),
    )

class APIConfig(Base):
    """API配置表 - 存储各模型的API密钥"""
    __tablename__ = "api_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50), unique=True, index=True, nullable=False)  # 模型名称
    api_key = Column(Text, nullable=False)  # API密钥（加密存储）
    api_url = Column(String(500))  # 自定义API地址
    is_active = Column(Boolean, default=True, index=True)  # 是否启用
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 添加联合索引：模型+启用状态
    __table_args__ = (
        Index("idx_apiconfig_model_active", "model_name", "is_active"),
    )

class PromptTemplate(Base):
    """提示词模板表 - 存储可配置的提示词"""
    __tablename__ = "prompt_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    template_key = Column(String(100), unique=True, index=True, nullable=False)  # 模板标识
    template_name = Column(String(200), nullable=False)  # 模板名称
    description = Column(String(500))  # 模板描述
    content = Column(Text, nullable=False)  # 模板内容
    category = Column(String(50), index=True)  # 分类（如：大纲、章节、编辑）
    is_active = Column(Boolean, default=True, index=True)  # 是否启用
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 添加联合索引：分类+启用状态（用于按分类获取模板）
    __table_args__ = (
        Index("idx_prompt_category_active", "category", "is_active"),
    )

class SystemConfig(Base):
    """系统配置表 - 存储系统级配置"""
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, index=True, nullable=False)  # 配置项标识
    config_value = Column(Text)  # 配置值
    description = Column(String(500))  # 配置描述
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
