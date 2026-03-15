import httpx
import json
from typing import Dict, List, Optional
from config import settings
from prompts import get_prompt
from config_manager import config_manager

class AIService:
    def __init__(self):
        self.api_key = settings.AI_MODEL_API_KEY
        self.api_url = settings.AI_MODEL_API_URL
        self.model_name = settings.AI_MODEL_NAME
    
    def _get_api_key(self, model: str = None) -> str:
        """获取 API Key，优先从配置管理器获取"""
        target_model = model or self.model_name
        # 优先从配置管理器获取
        key = config_manager.get_api_key(target_model)
        if key:
            return key
        # 否则使用默认配置
        return self.api_key
    
    # ==================== 分步骤生成功能 ====================
    
    async def generate_title_suggestions(self, description: str, genre: str) -> Dict:
        """步骤1: 生成书名建议"""
        prompt = get_prompt(
            "TITLE_SUGGESTION_PROMPT",
            description=description,
            genre=genre
        )
        return await self._call_api_with_fallback(prompt, "书名生成失败")
    
    async def generate_description(self, title: str, description: str, genre: str) -> Dict:
        """步骤2: 生成爆款简介"""
        prompt = get_prompt(
            "DESCRIPTION_GENERATION_PROMPT",
            title=title,
            description=description,
            genre=genre
        )
        return await self._call_api_with_fallback(prompt, "简介生成失败")
    
    async def generate_world_building(self, title: str, description: str, genre: str) -> Dict:
        """步骤3: 生成世界观设定"""
        prompt = get_prompt(
            "WORLD_BUILDING_PROMPT",
            title=title,
            description=description,
            genre=genre
        )
        return await self._call_api_with_fallback(prompt, "世界观生成失败")
    
    async def generate_protagonist(self, title: str, description: str, genre: str) -> Dict:
        """步骤4: 生成主角设定"""
        prompt = get_prompt(
            "PROTAGONIST_GENERATION_PROMPT",
            title=title,
            description=description,
            genre=genre
        )
        return await self._call_api_with_fallback(prompt, "主角设定生成失败")
    
    async def generate_characters(self, title: str, description: str, genre: str, protagonist: str) -> Dict:
        """步骤5: 生成主要人物"""
        prompt = get_prompt(
            "CHARACTERS_GENERATION_PROMPT",
            title=title,
            description=description,
            genre=genre,
            protagonist=protagonist
        )
        return await self._call_api_with_fallback(prompt, "人物设定生成失败")
    
    async def generate_full_outline(self, title: str, description: str, genre: str, 
                                   world_building: str, protagonist: str, characters: str) -> Dict:
        """步骤6: 生成全书大纲"""
        prompt = get_prompt(
            "FULL_OUTLINE_PROMPT",
            title=title,
            description=description,
            genre=genre,
            world_building=world_building,
            protagonist=protagonist,
            characters=characters
        )
        return await self._call_api_with_fallback(prompt, "全书大纲生成失败")
    
    async def generate_volume_outline(self, title: str, description: str, genre: str,
                                     volume_theme: str, volume_events: str) -> Dict:
        """步骤7: 生成分卷细纲"""
        prompt = get_prompt(
            "VOLUME_OUTLINE_PROMPT",
            title=title,
            description=description,
            genre=genre,
            volume_theme=volume_theme,
            volume_events=volume_events
        )
        return await self._call_api_with_fallback(prompt, "分卷细纲生成失败")
    
    # ==================== 原有功能 ====================
    
    async def generate_novel_outline(self, title: str, description: str, genre: str) -> Dict:
        """一键生成完整大纲（使用步骤1-7的组合）"""
        try:
            # 依次调用各步骤
            step1 = await self.generate_title_suggestions(description, genre)
            step2 = await self.generate_description(title, description, genre)
            step3 = await self.generate_world_building(title, description, genre)
            step4 = await self.generate_protagonist(title, description, genre)
            step5 = await self.generate_characters(title, description, genre, step4.get("data", ""))
            step6 = await self.generate_full_outline(title, description, genre, 
                                                     step3.get("data", ""), 
                                                     step4.get("data", ""), 
                                                     step5.get("data", ""))
            step7 = await self.generate_volume_outline(title, description, genre,
                                                       "第一卷：觉醒篇",
                                                       "主角获得金手指，开始成长")
            
            # 组合所有结果
            full_outline = f"""【1 小说书名】
{step1.get('data', '书名生成失败')}

【2 小说简介】
{step2.get('data', '简介生成失败')}

【3 世界观设定】
{step3.get('data', '世界观生成失败')}

【4 主角设定】
{step4.get('data', '主角设定生成失败')}

【5 主要人物】
{step5.get('data', '人物设定生成失败')}

【6 全书大纲】
{step6.get('data', '大纲生成失败')}

【7 分卷细纲】
{step7.get('data', '细纲生成失败')}"""
            
            return {"success": True, "data": full_outline}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def generate_chapter(self, novel_context: str, chapter_outline: str, chapter_number: int) -> Dict:
        """生成章节正文"""
        prompt = get_prompt(
            "CHAPTER_GENERATION_PROMPT",
            title=novel_context,
            genre="",
            chapter_number=chapter_number,
            chapter_outline=chapter_outline
        )
        return await self._call_api_with_fallback(prompt, "章节生成失败")
    
    # ==================== 智能编辑器功能 ====================
    
    async def continue_writing(self, text: str, context: str = "") -> Dict:
        """续写功能"""
        prompt = get_prompt("CONTINUE_WRITING_PROMPT", text=text, context=context)
        return await self._call_api_with_fallback(prompt, "续写失败")
    
    async def expand_text(self, text: str, context: str = "") -> Dict:
        """扩写功能"""
        prompt = get_prompt("EXPAND_TEXT_PROMPT", text=text, context=context)
        return await self._call_api_with_fallback(prompt, "扩写失败")
    
    async def polish_text(self, text: str, style: str = "流畅") -> Dict:
        """润色功能"""
        prompt = get_prompt("POLISH_TEXT_PROMPT", text=text, style=style)
        return await self._call_api_with_fallback(prompt, "润色失败")
    
    async def review_text(self, text: str) -> Dict:
        """审稿功能"""
        prompt = get_prompt("REVIEW_TEXT_PROMPT", text=text)
        return await self._call_api_with_fallback(prompt, "审稿失败")
    
    # ==================== 辅助方法 ====================
    
    async def _call_api_with_fallback(self, prompt: str, error_message: str) -> Dict:
        """调用API并处理失败情况"""
        try:
            response = await self._call_api(prompt)
            return {"success": True, "data": response}
        except Exception as e:
            print(f"{error_message}: {e}")
            return {"success": False, "error": str(e), "data": ""}
    
    async def _call_api(self, prompt: str) -> str:
        """调用AI API"""
        # 动态获取当前模型的 API Key
        self.api_key = self._get_api_key()
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            if self.model_name == "zhipu":
                return await self._call_zhipu(client, prompt)
            elif self.model_name == "qwen":
                return await self._call_qwen(client, prompt)
            elif self.model_name == "deepseek":
                return await self._call_deepseek(client, prompt)
            elif self.model_name == "doubao":
                return await self._call_doubao(client, prompt)
            elif self.model_name == "kimi":
                return await self._call_kimi(client, prompt)
            else:
                raise ValueError(f"不支持的模型: {self.model_name}")
    
    async def _call_zhipu(self, client: httpx.AsyncClient, prompt: str) -> str:
        """调用智谱AI"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "glm-4",
            "messages": [
                {"role": "system", "content": get_prompt("SYSTEM_PROMPT")},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 4000
        }
        
        response = await client.post(
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def _call_qwen(self, client: httpx.AsyncClient, prompt: str) -> str:
        """调用通义千问"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "qwen-turbo",
            "input": {
                "messages": [
                    {"role": "system", "content": get_prompt("SYSTEM_PROMPT")},
                    {"role": "user", "content": prompt}
                ]
            },
            "parameters": {
                "temperature": 0.8,
                "max_tokens": 4000
            }
        }
        
        response = await client.post(
            "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        result = response.json()
        return result["output"]["choices"][0]["message"]["content"]
    
    async def _call_deepseek(self, client: httpx.AsyncClient, prompt: str) -> str:
        """调用 DeepSeek API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # 使用 DeepSeek V3 模型
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": get_prompt("SYSTEM_PROMPT")},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 4000,
            "stream": False
        }
        
        # DeepSeek API 地址
        api_url = self.api_url or "https://api.deepseek.com/v1/chat/completions"
        
        response = await client.post(
            api_url,
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def _call_doubao(self, client: httpx.AsyncClient, prompt: str) -> str:
        """调用豆包大模型 API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # 豆包模型配置
        # 可选模型：doubao-lite-4k, doubao-pro-4k, doubao-pro-32k, doubao-pro-128k
        payload = {
            "model": "doubao-pro-32k",  # 使用专业版32K上下文
            "messages": [
                {"role": "system", "content": get_prompt("SYSTEM_PROMPT")},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 4000
        }
        
        # 豆包 API 地址（火山引擎）
        api_url = self.api_url or "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
        
        response = await client.post(
            api_url,
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def _call_kimi(self, client: httpx.AsyncClient, prompt: str) -> str:
        """调用 Kimi (月之暗面) API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Kimi 模型配置
        # 可选模型：moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
        payload = {
            "model": "moonshot-v1-32k",  # 使用32K上下文版本
            "messages": [
                {"role": "system", "content": get_prompt("SYSTEM_PROMPT")},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 4000
        }
        
        # Kimi API 地址
        api_url = self.api_url or "https://api.moonshot.cn/v1/chat/completions"
        
        response = await client.post(
            api_url,
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]

# 全局AI服务实例
ai_service = AIService()
