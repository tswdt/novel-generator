from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/novel_generator"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    AI_MODEL_API_KEY: str = ""
    AI_MODEL_API_URL: str = ""
    AI_MODEL_NAME: str = "zhipu"  # 可选: zhipu, qwen, deepseek, doubao
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    PAYMENT_API_KEY: str = ""
    PAYMENT_SECRET: str = ""
    
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"

settings = Settings()
