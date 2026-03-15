"""
配置管理模块 - 支持动态保存和读取配置
"""
import json
import os
from typing import Dict, Optional

CONFIG_FILE = "config_storage.json"

# 默认配置
DEFAULT_CONFIG = {
    "api_keys": {
        "zhipu": "",
        "qwen": "",
        "deepseek": "",
        "doubao": "",
        "kimi": ""
    },
    "default_model": "zhipu",
    "prompts": {}
}

class ConfigManager:
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self) -> Dict:
        """加载配置文件"""
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    # 合并默认配置
                    for key in DEFAULT_CONFIG:
                        if key not in config:
                            config[key] = DEFAULT_CONFIG[key]
                    return config
            except Exception as e:
                print(f"加载配置文件失败: {e}")
                return DEFAULT_CONFIG.copy()
        return DEFAULT_CONFIG.copy()
    
    def _save_config(self):
        """保存配置文件"""
        try:
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"保存配置文件失败: {e}")
            return False
    
    def get_api_key(self, model: str) -> str:
        """获取指定模型的 API Key"""
        return self.config.get("api_keys", {}).get(model, "")
    
    def set_api_key(self, model: str, api_key: str) -> bool:
        """设置指定模型的 API Key"""
        if "api_keys" not in self.config:
            self.config["api_keys"] = {}
        self.config["api_keys"][model] = api_key
        return self._save_config()
    
    def get_all_api_keys(self) -> Dict[str, str]:
        """获取所有 API Keys（脱敏显示）"""
        keys = self.config.get("api_keys", {})
        # 脱敏处理：只显示前8位和后4位
        masked_keys = {}
        for model, key in keys.items():
            if key and len(key) > 12:
                masked_keys[model] = f"{key[:8]}...{key[-4:]}"
            elif key:
                masked_keys[model] = f"{key[:4]}***"
            else:
                masked_keys[model] = ""
        return masked_keys
    
    def get_default_model(self) -> str:
        """获取默认模型"""
        return self.config.get("default_model", "zhipu")
    
    def set_default_model(self, model: str) -> bool:
        """设置默认模型"""
        self.config["default_model"] = model
        return self._save_config()
    
    def get_prompt(self, prompt_id: str) -> Optional[str]:
        """获取自定义提示词"""
        return self.config.get("prompts", {}).get(prompt_id)
    
    def set_prompt(self, prompt_id: str, prompt_content: str) -> bool:
        """设置自定义提示词"""
        if "prompts" not in self.config:
            self.config["prompts"] = {}
        self.config["prompts"][prompt_id] = prompt_content
        return self._save_config()
    
    def get_all_prompts(self) -> Dict[str, str]:
        """获取所有自定义提示词"""
        return self.config.get("prompts", {})
    
    def delete_prompt(self, prompt_id: str) -> bool:
        """删除自定义提示词"""
        if prompt_id in self.config.get("prompts", {}):
            del self.config["prompts"][prompt_id]
            return self._save_config()
        return False
    
    def get_full_config(self) -> Dict:
        """获取完整配置（API Keys 脱敏）"""
        return {
            "api_keys": self.get_all_api_keys(),
            "default_model": self.get_default_model(),
            "prompts": self.get_all_prompts()
        }

# 全局配置管理器
config_manager = ConfigManager()
