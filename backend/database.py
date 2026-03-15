from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool
from config import settings
import time

# 2核4G配置：连接池大小设为8（默认10+易超限），回收超时设为30秒
# 使用QueuePool作为连接池实现
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=8,  # 连接池大小
    max_overflow=2,  # 超出pool_size的临时连接数
    pool_recycle=30,  # 30秒回收连接，避免闲置连接占资源
    pool_pre_ping=True,  # 检查连接可用性，避免无效连接
    pool_timeout=30,  # 获取连接的超时时间
    echo=settings.DEBUG,  # 仅在调试模式下输出SQL
)

# 监听连接事件，用于调试（仅在DEBUG模式下）
if settings.DEBUG:
    @event.listens_for(engine, "connect")
    def on_connect(dbapi_conn, connection_record):
        print(f"[DB] 新数据库连接已建立: {id(dbapi_conn)}")
    
    @event.listens_for(engine, "checkout")
    def on_checkout(dbapi_conn, connection_record, connection_proxy):
        print(f"[DB] 连接被检出: {id(dbapi_conn)}")
    
    @event.listens_for(engine, "checkin")
    def on_checkin(dbapi_conn, connection_record):
        print(f"[DB] 连接被归还: {id(dbapi_conn)}")

# 创建会话工厂
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False  # 提交后不立即过期，提高性能
)

# 使用scoped_session实现线程安全
# 这在多worker环境下非常重要
db_session = scoped_session(SessionLocal)

def get_db():
    """获取数据库会话（生成器模式）"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()

def get_db_session():
    """获取数据库会话（直接返回）"""
    return db_session()

class DatabaseManager:
    """数据库管理器 - 提供高级数据库操作"""
    
    @staticmethod
    def check_connection():
        """检查数据库连接是否正常"""
        try:
            with engine.connect() as conn:
                result = conn.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"数据库连接检查失败: {e}")
            return False
    
    @staticmethod
    def get_pool_status():
        """获取连接池状态"""
        return {
            "size": engine.pool.size(),
            "checked_in": engine.pool.checkedin(),
            "checked_out": engine.pool.checkedout(),
            "overflow": engine.pool.overflow()
        }
    
    @staticmethod
    def close_all_connections():
        """关闭所有数据库连接（用于优雅关闭）"""
        engine.dispose()
        print("所有数据库连接已关闭")

# 全局数据库管理器实例
db_manager = DatabaseManager()
