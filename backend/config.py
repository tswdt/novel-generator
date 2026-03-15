from pydantic_settings import BaseSettings
from typing import Optional
import os
import logging
from logging.handlers import RotatingFileHandler

class Settings(BaseSettings):
    ENV: str = os.getenv("ENV", "production")
    DEBUG: bool = ENV != "production"
    
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/novel_generator"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    AI_MODEL_API_KEY: str = ""
    AI_MODEL_API_URL: str = ""
    AI_MODEL_NAME: str = "zhipu"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_CACHE_TTL: int = 7200
    
    PAYMENT_API_KEY: str = ""
    PAYMENT_SECRET: str = ""
    
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    MAX_WORKERS: int = 3
    AI_TIMEOUT: int = 120
    
    class Config:
        env_file = ".env"

settings = Settings()

REDIS_CONFIG = {
    "host": settings.REDIS_HOST,
    "port": settings.REDIS_PORT,
    "password": settings.REDIS_PASSWORD,
    "db": settings.REDIS_DB
}

def setup_logging():
    """配置日志轮转"""
    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    
    log_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=500 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    log_handler.setFormatter(log_formatter)
    log_handler.setLevel(logging.WARNING)
    
    app_logger = logging.getLogger('uvicorn')
    app_logger.addHandler(log_handler)
    app_logger.setLevel(logging.WARNING)
    
    return app_logger

app_logger = setup_logging()
