# backend/cache.py
import redis
import json
import hashlib
from typing import Optional, Any
from config import settings, REDIS_CONFIG

class CacheManager:
    """Redis缓存管理器"""
    
    def __init__(self):
        self.client = None
        self.enabled = False
        self._connect()
    
    def _connect(self):
        """连接Redis服务器"""
        try:
            self.client = redis.Redis(
                host=REDIS_CONFIG["host"],
                port=REDIS_CONFIG["port"],
                password=REDIS_CONFIG["password"] if REDIS_CONFIG["password"] else None,
                db=REDIS_CONFIG["db"],
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                health_check_interval=30
            )
            # 测试连接
            self.client.ping()
            self.enabled = True
            print("✅ Redis缓存已启用")
        except Exception as e:
            print(f"⚠️ Redis连接失败: {e}")
            print("💡 提示：应用将在无缓存模式下运行")
            self.enabled = False
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """生成缓存key"""
        # 将所有参数组合成字符串
        key_parts = [prefix]
        for arg in args:
            key_parts.append(str(arg))
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}:{v}")
        
        raw_key = ":".join(key_parts)
        # 使用MD5哈希缩短key长度
        return f"{prefix}:{hashlib.md5(raw_key.encode()).hexdigest()}"
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        if not self.enabled:
            return None
        
        try:
            data = self.client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            print(f"缓存读取错误: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """设置缓存"""
        if not self.enabled:
            return False
        
        try:
            ttl = ttl or settings.REDIS_CACHE_TTL
            self.client.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            print(f"缓存写入错误: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """删除缓存"""
        if not self.enabled:
            return False
        
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            print(f"缓存删除错误: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> bool:
        """删除匹配模式的缓存"""
        if not self.enabled:
            return False
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
            return True
        except Exception as e:
            print(f"缓存批量删除错误: {e}")
            return False
    
    def clear(self) -> bool:
        """清空所有缓存（谨慎使用）"""
        if not self.enabled:
            return False
        
        try:
            self.client.flushdb()
            return True
        except Exception as e:
            print(f"缓存清空错误: {e}")
            return False
    
    # ==================== AI生成内容缓存方法 ====================
    
    def get_novel_outline(self, topic: str, genre: str, user_id: int) -> Optional[dict]:
        """获取小说大纲缓存"""
        key = self._generate_key("novel:outline", genre, topic, user_id)
        return self.get(key)
    
    def set_novel_outline(self, topic: str, genre: str, user_id: int, data: dict, ttl: int = 7200) -> bool:
        """设置小说大纲缓存"""
        key = self._generate_key("novel:outline", genre, topic, user_id)
        return self.set(key, data, ttl)
    
    def get_title_suggestions(self, description: str, genre: str) -> Optional[dict]:
        """获取书名建议缓存"""
        key = self._generate_key("title:suggestions", genre, description[:50])
        return self.get(key)
    
    def set_title_suggestions(self, description: str, genre: str, data: dict, ttl: int = 3600) -> bool:
        """设置书名建议缓存"""
        key = self._generate_key("title:suggestions", genre, description[:50])
        return self.set(key, data, ttl)
    
    def get_chapter_content(self, novel_id: int, chapter_number: int) -> Optional[dict]:
        """获取章节内容缓存"""
        key = self._generate_key("chapter:content", novel_id, chapter_number)
        return self.get(key)
    
    def set_chapter_content(self, novel_id: int, chapter_number: int, data: dict, ttl: int = 7200) -> bool:
        """设置章节内容缓存"""
        key = self._generate_key("chapter:content", novel_id, chapter_number)
        return self.set(key, data, ttl)
    
    def get_generation_task(self, task_id: str) -> Optional[dict]:
        """获取生成任务缓存"""
        key = self._generate_key("generation:task", task_id)
        return self.get(key)
    
    def set_generation_task(self, task_id: str, data: dict, ttl: int = 3600) -> bool:
        """设置生成任务缓存"""
        key = self._generate_key("generation:task", task_id)
        return self.set(key, data, ttl)
    
    def get_prompt_template(self, prompt_type: str) -> Optional[dict]:
        """获取提示词模板缓存"""
        key = self._generate_key("prompt:template", prompt_type)
        return self.get(key)
    
    def set_prompt_template(self, prompt_type: str, data: dict, ttl: int = 86400) -> bool:
        """设置提示词模板缓存（24小时）"""
        key = self._generate_key("prompt:template", prompt_type)
        return self.set(key, data, ttl)
    
    # ==================== 统计数据缓存 ====================
    
    def get_stats(self, stat_type: str) -> Optional[dict]:
        """获取统计数据缓存"""
        key = self._generate_key("stats", stat_type)
        return self.get(key)
    
    def set_stats(self, stat_type: str, data: dict, ttl: int = 300) -> bool:
        """设置统计数据缓存（5分钟）"""
        key = self._generate_key("stats", stat_type)
        return self.set(key, data, ttl)
    
    def increment_counter(self, counter_name: str, amount: int = 1) -> int:
        """增加计数器"""
        if not self.enabled:
            return 0
        
        try:
            return self.client.incrby(f"counter:{counter_name}", amount)
        except Exception as e:
            print(f"计数器增加错误: {e}")
            return 0
    
    def get_counter(self, counter_name: str) -> int:
        """获取计数器值"""
        if not self.enabled:
            return 0
        
        try:
            value = self.client.get(f"counter:{counter_name}")
            return int(value) if value else 0
        except Exception as e:
            print(f"计数器读取错误: {e}")
            return 0

# 全局缓存管理器实例
cache_manager = CacheManager()
