from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ai_service import ai_service

app = FastAPI(title="码字成书API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id: int
    username: str
    email: str
    balance: float

class Novel(BaseModel):
    id: int
    title: str
    description: str
    genre: str
    status: str
    total_chapters: int
    generated_chapters: int
    word_count: int

class Chapter(BaseModel):
    id: int
    chapter_number: int
    title: str
    content: str
    word_count: int

users_db = []
novels_db = []
chapters_db = []

@app.get("/")
async def root():
    return {"message": "码字成书API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/auth/register")
async def register(username: str, email: str, password: str):
    user_id = len(users_db) + 1
    user = User(id=user_id, username=username, email=email, balance=100.0)
    users_db.append(user)
    return {"user": user, "token": "demo-token"}

@app.post("/auth/login")
async def login(username: str, password: str):
    user = next((u for u in users_db if u.username == username), None)
    if not user:
        user = User(id=1, username=username, email=f"{username}@demo.com", balance=100.0)
        users_db.append(user)
    return {"user": user, "token": "demo-token"}

@app.get("/auth/me")
async def get_current_user():
    return {"id": 1, "username": "demo", "email": "demo@example.com", "balance": 100.0}

class CreateNovelRequest(BaseModel):
    title: str
    description: str
    genre: str
    total_chapters: int = 20

@app.post("/novels/create")
async def create_novel(request: CreateNovelRequest):
    novel_id = len(novels_db) + 1
    novel = Novel(
        id=novel_id,
        title=request.title,
        description=request.description,
        genre=request.genre,
        status="generating",
        total_chapters=request.total_chapters,
        generated_chapters=0,
        word_count=0
    )
    novels_db.append(novel)
    return novel

@app.post("/novels/{novel_id}/generate-outline")
async def generate_outline(novel_id: int):
    # 获取小说信息
    novel = next((n for n in novels_db if n.id == novel_id), None)
    if not novel:
        return {"success": False, "error": "小说不存在"}
    
    # 使用AI服务生成大纲
    result = await ai_service.generate_novel_outline(
        title=novel.title,
        description=novel.description,
        genre=novel.genre
    )
    
    if result["success"]:
        outline = result["data"]
    else:
        # 如果AI服务失败，使用默认大纲
        outline = f"""【1 小说书名】
1. {novel.title}
2. {novel.title}之巅峰传奇
3. 重生之{novel.title}

【2 小说简介】
{novel.description}

【3 世界观设定】
现代都市背景，存在神秘的系统金手指

【4 主角设定】
主角，拥有系统，性格杀伐果断，护短

【5 主要人物】
主角、女主、反派、师父、助手

【6 故事总体大纲】
主角获得系统，从被看不起的小人物成长为一代强者，同时打脸复仇，收获爱情和财富

【7 剧情阶段规划】
第一卷：觉醒篇（1-20章）
第二卷：成长篇（21-50章）
第三卷：崛起篇（51-80章）
第四卷：巅峰篇（81-100章）

【8 前20章章节细纲】
第1章：重生觉醒 - 主角重生，激活系统
第2章：系统激活 - 系统功能介绍，新手礼包
第3章：初试牛刀 - 第一次展示能力
第4章：实力首秀 - 展示实力
第5章：打脸开始 - 遇到看不起自己的人
第6章：系统升级 - 完成任务升级系统
第7章：遇到女主 - 初次遇见女主
第8章：解决难题 - 解决难题获得名声
第9章：反派登场 - 反派出现
第10章：正面冲突 - 与反派第一次冲突
第11章：系统新功能 - 解锁新功能
第12章：能力提升 - 能力大幅提升
第13章：名声大噪 - 出名
第14章：财富积累 - 开始积累财富
第15章：感情升温 - 与女主感情升温
第16章：阴谋浮现 - 发现反派的阴谋
第17章：智斗反派 - 与反派智斗
第18章：系统爆发 - 系统能力爆发
第19章：危机解除 - 解决危机
第20章：新的开始 - 迎接新的挑战

【9 第一章完整正文】
第1章 重生觉醒

被踹出家门当天，我激活亿万神豪系统，反手收购岳父公司。

林凡站在别墅门口，看着紧闭的大门，拳头紧紧攥住。

"从今天起，你们会后悔的。"

就在这时，一道冰冷的机械音在他脑海中响起：

"叮！神医系统已激活，新手礼包已发放到账。"

林凡愣住了，随即狂喜涌上心头。

"系统？我竟然有系统！"

他立刻查看系统面板，发现新手礼包包含：
- 基础医术精通
- 诊断术（初级）
- 治疗术（初级）
- 100万启动资金

"太好了！有了这些，我一定能改变命运！"

林凡握紧拳头，眼中闪过坚定的光芒。

就在这时，一个穿着白大褂的中年人匆匆走过，看到林凡站在门口，好奇地问：

"小伙子，你没事吧？"

林凡抬头一看，认出这是附近医院的张医生。

"张医生，我没事。"

张医生打量着林凡，突然皱起眉头：

"不对，你的脸色不太好，是不是生病了？"

林凡心中一动，系统立刻给出诊断：

"叮！检测到目标人物张医生患有早期肝癌，治愈成功率：95%"

林凡心中一惊，随即冷静下来：

"张医生，我建议你去做个全面体检，特别是肝脏方面。"

张医生愣了一下，随即笑道：

"小伙子，我是医生，我自己的身体我清楚。"

林凡没有多说什么，只是淡淡道：

"信不信由你，不过我建议你尽快检查。"

张医生摇摇头，转身离开。

林凡看着他的背影，心中暗道：

"系统，治愈术需要什么条件？"

"叮！治愈术需要消耗10点能量值，当前能量值：100点"

林凡点点头，准备找个机会帮助张医生。

就在这时，手机响了，是前女友苏倩打来的。

"林凡，你还在外面吗？赶紧回来，把你的东西拿走！"

林凡冷笑一声：

"好，我马上回去。"

挂断电话，林凡眼中闪过一丝寒光。

"苏倩，你们会后悔的！"

（未完待续...）"""
    
    return {"success": True, "outline": outline}

class GenerateChapterRequest(BaseModel):
    chapter_outline: str

@app.post("/novels/{novel_id}/generate-chapter/{chapter_number}")
async def generate_chapter(novel_id: int, chapter_number: int, request: GenerateChapterRequest):
    # 获取小说信息
    novel = next((n for n in novels_db if n.id == novel_id), None)
    if not novel:
        return {"success": False, "error": "小说不存在"}
    
    # 使用AI服务生成章节
    result = await ai_service.generate_chapter(
        novel_context=f"{novel.title} - {novel.description}",
        chapter_outline=request.chapter_outline,
        chapter_number=chapter_number
    )
    
    if not result["success"]:
        # 如果AI服务失败，使用默认内容
        content = f"""第{chapter_number}章 {request.chapter_outline.split('：')[0] if '：' in request.chapter_outline else '新章节'}

{request.chapter_outline}

林凡深吸一口气，开始施展医术。

"系统，启动治疗术！"

"叮！治疗术已启动，消耗10点能量值"

一道柔和的光芒从林凡手中发出，笼罩在病人身上。

"这...这是什么？"病人惊讶地看着林凡。

"别说话，放松。"林凡专注地施展医术。

片刻之后，光芒消散。

"好了，你可以起来了。"

病人试探性地活动了一下，惊喜地发现疼痛消失了。

"真的好了！谢谢你，林医生！"

周围的人纷纷投来惊讶的目光。

"太神奇了！"

"这就是传说中的神医吗？"

林凡微笑着点点头，心中暗道：

"系统，这次治疗获得多少经验？"

"叮！治疗成功，获得经验值50点，当前等级：1级（50/100）"

林凡心中一喜，继续投入到治疗中。

（未完待续...）"""
    else:
        content = result["data"]
    
    chapter = Chapter(
        id=chapter_id,
        chapter_number=chapter_number,
        title=f"第{chapter_number}章",
        content=content,
        word_count=len(content)
    )
    chapters_db.append(chapter)
    
    novel = next((n for n in novels_db if n.id == novel_id), None)
    if novel:
        novel.generated_chapters += 1
        novel.word_count += len(content)
    
    return {"success": True, "chapter": chapter}

@app.get("/novels/")
async def get_novels():
    return novels_db

@app.get("/novels/{novel_id}")
async def get_novel(novel_id: int):
    novel = next((n for n in novels_db if n.id == novel_id), None)
    if not novel:
        return {"error": "小说不存在"}
    return novel

@app.get("/novels/{novel_id}/chapters")
async def get_chapters(novel_id: int):
    return [c for c in chapters_db if c.id == novel_id]

@app.get("/novels/{novel_id}/chapters/{chapter_number}")
async def get_chapter(novel_id: int, chapter_number: int):
    chapter = next((c for c in chapters_db if c.chapter_number == chapter_number), None)
    if not chapter:
        return {"error": "章节不存在"}
    return chapter

@app.delete("/novels/{novel_id}")
async def delete_novel(novel_id: int):
    global novels_db
    novels_db = [n for n in novels_db if n.id != novel_id]
    return {"success": True, "message": "删除成功"}

@app.post("/payment/create-order")
async def create_order(amount: float, payment_method: str = "wechat"):
    return {"id": 1, "order_no": f"ORD{len(users_db) + 1}", "amount": amount, "status": "paid", "payment_method": payment_method}

@app.get("/payment/orders")
async def get_orders():
    return []

@app.get("/payment/balance")
async def get_balance():
    return {"balance": 100.0}

# ==================== 分步骤生成API ====================

class StepGenerateRequest(BaseModel):
    step: str
    title: str = ""
    description: str = ""
    genre: str = ""
    previous_results: dict = {}
    model: str = "zhipu"  # 添加模型选择参数，默认为智谱AI

@app.post("/novels/{novel_id}/generate-step")
async def generate_step(novel_id: int, request: StepGenerateRequest):
    """分步骤生成小说内容"""
    novel = next((n for n in novels_db if n.id == novel_id), None)
    if not novel:
        return {"success": False, "error": "小说不存在"}
    
    step = request.step
    title = request.title or novel.title
    description = request.description or novel.description
    genre = request.genre or novel.genre
    previous = request.previous_results
    model = request.model  # 获取前端选择的模型
    
    try:
        # 临时切换模型
        original_model = ai_service.model_name
        ai_service.model_name = model
        
        if step == "title":
            # 步骤1: 书名建议
            result = await ai_service.generate_title_suggestions(description, genre)
        elif step == "description":
            # 步骤2: 简介生成
            result = await ai_service.generate_description(title, description, genre)
        elif step == "world":
            # 步骤3: 世界观
            result = await ai_service.generate_world_building(title, description, genre)
        elif step == "protagonist":
            # 步骤4: 主角设定
            result = await ai_service.generate_protagonist(title, description, genre)
        elif step == "characters":
            # 步骤5: 人物设定
            protagonist = previous.get("protagonist", "")
            result = await ai_service.generate_characters(title, description, genre, protagonist)
        elif step == "outline":
            # 步骤6: 全书大纲
            world = previous.get("world", "")
            protagonist = previous.get("protagonist", "")
            characters = previous.get("characters", "")
            result = await ai_service.generate_full_outline(title, description, genre, world, protagonist, characters)
        elif step == "volume":
            # 步骤7: 分卷细纲
            volume_theme = previous.get("volume_theme", "第一卷：觉醒篇")
            volume_events = previous.get("volume_events", "主角获得金手指，开始成长")
            result = await ai_service.generate_volume_outline(title, description, genre, volume_theme, volume_events)
        else:
            # 恢复原始模型
            ai_service.model_name = original_model
            return {"success": False, "error": "未知的生成步骤"}
        
        # 恢复原始模型
        ai_service.model_name = original_model
        
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/generation-steps")
async def get_generation_steps():
    """获取分步骤生成列表"""
    from prompts import GENERATION_STEPS
    return GENERATION_STEPS

# ==================== 智能编辑器API ====================

class EditorRequest(BaseModel):
    text: str
    context: str = ""
    style: str = "流畅"

@app.post("/editor/continue")
async def editor_continue(request: EditorRequest):
    """续写功能"""
    result = await ai_service.continue_writing(request.text, request.context)
    return result

@app.post("/editor/expand")
async def editor_expand(request: EditorRequest):
    """扩写功能"""
    result = await ai_service.expand_text(request.text, request.context)
    return result

@app.post("/editor/polish")
async def editor_polish(request: EditorRequest):
    """润色功能"""
    result = await ai_service.polish_text(request.text, request.style)
    return result

@app.post("/editor/review")
async def editor_review(request: EditorRequest):
    """审稿功能"""
    result = await ai_service.review_text(request.text)
    return result

# ==================== 提示词宝库API ====================

@app.get("/prompt-templates")
async def get_prompt_templates():
    """获取所有提示词模板"""
    from prompts import PROMPT_TEMPLATES
    return PROMPT_TEMPLATES

@app.get("/prompt-templates/{category}")
async def get_prompt_templates_by_category(category: str):
    """按分类获取提示词模板"""
    from prompts import PROMPT_TEMPLATES
    return PROMPT_TEMPLATES.get(category, [])

# ==================== 角色档案管理API ====================

class Character(BaseModel):
    id: Optional[int] = None
    novel_id: int
    name: str
    role: str
    appearance: str = ""
    background: str = ""
    personality: str = ""
    abilities: str = ""
    relationships: str = ""
    notes: str = ""

characters_db = []

@app.post("/characters/create")
async def create_character(character: Character):
    """创建角色档案"""
    character_id = len(characters_db) + 1
    character.id = character_id
    characters_db.append(character)
    return character

@app.get("/characters/novel/{novel_id}")
async def get_characters_by_novel(novel_id: int):
    """获取小说的所有角色"""
    return [c for c in characters_db if c.novel_id == novel_id]

@app.get("/characters/{character_id}")
async def get_character(character_id: int):
    """获取单个角色详情"""
    character = next((c for c in characters_db if c.id == character_id), None)
    if not character:
        return {"error": "角色不存在"}
    return character

@app.put("/characters/{character_id}")
async def update_character(character_id: int, character: Character):
    """更新角色档案"""
    index = next((i for i, c in enumerate(characters_db) if c.id == character_id), None)
    if index is None:
        return {"error": "角色不存在"}
    character.id = character_id
    characters_db[index] = character
    return character

@app.delete("/characters/{character_id}")
async def delete_character(character_id: int):
    """删除角色档案"""
    global characters_db
    characters_db = [c for c in characters_db if c.id != character_id]
    return {"success": True, "message": "删除成功"}

# ==================== 世界观词条库API ====================

class WorldEntry(BaseModel):
    id: Optional[int] = None
    novel_id: int
    title: str
    category: str
    content: str
    tags: List[str] = []

world_entries_db = []

@app.post("/world-entries/create")
async def create_world_entry(entry: WorldEntry):
    """创建世界观词条"""
    entry_id = len(world_entries_db) + 1
    entry.id = entry_id
    world_entries_db.append(entry)
    return entry

@app.get("/world-entries/novel/{novel_id}")
async def get_world_entries_by_novel(novel_id: int):
    """获取小说的所有世界观词条"""
    return [e for e in world_entries_db if e.novel_id == novel_id]

@app.get("/world-entries/novel/{novel_id}/category/{category}")
async def get_world_entries_by_category(novel_id: int, category: str):
    """按分类获取世界观词条"""
    return [e for e in world_entries_db if e.novel_id == novel_id and e.category == category]

@app.get("/world-entries/{entry_id}")
async def get_world_entry(entry_id: int):
    """获取单个词条详情"""
    entry = next((e for e in world_entries_db if e.id == entry_id), None)
    if not entry:
        return {"error": "词条不存在"}
    return entry

@app.put("/world-entries/{entry_id}")
async def update_world_entry(entry_id: int, entry: WorldEntry):
    """更新世界观词条"""
    index = next((i for i, e in enumerate(world_entries_db) if e.id == entry_id), None)
    if index is None:
        return {"error": "词条不存在"}
    entry.id = entry_id
    world_entries_db[index] = entry
    return entry

@app.delete("/world-entries/{entry_id}")
async def delete_world_entry(entry_id: int):
    """删除世界观词条"""
    global world_entries_db
    world_entries_db = [e for e in world_entries_db if e.id != entry_id]
    return {"success": True, "message": "删除成功"}

# ==================== 配置管理API ====================

from config_manager import config_manager

class APIKeyRequest(BaseModel):
    model: str
    api_key: str

class PromptRequest(BaseModel):
    prompt_id: str
    prompt_content: str

@app.get("/config")
async def get_config():
    """获取所有配置（API Keys 脱敏）"""
    return config_manager.get_full_config()

@app.post("/config/api-key")
async def set_api_key(request: APIKeyRequest):
    """设置 API Key"""
    success = config_manager.set_api_key(request.model, request.api_key)
    if success:
        return {"success": True, "message": f"{request.model} API Key 已保存"}
    return {"success": False, "message": "保存失败"}

@app.get("/config/api-key/{model}")
async def get_api_key(model: str):
    """获取指定模型的 API Key（完整，用于内部调用）"""
    key = config_manager.get_api_key(model)
    return {"model": model, "has_key": bool(key)}

@app.post("/config/default-model")
async def set_default_model(model: str):
    """设置默认模型"""
    success = config_manager.set_default_model(model)
    if success:
        return {"success": True, "message": f"默认模型已设置为 {model}"}
    return {"success": False, "message": "设置失败"}

@app.get("/config/default-prompts")
async def get_default_prompts():
    """获取所有默认提示词模板"""
    from prompts import get_all_prompts, get_generation_steps
    return {
        "prompts": get_all_prompts(),
        "steps": get_generation_steps()
    }

@app.post("/config/prompt")
async def set_prompt(request: PromptRequest):
    """设置自定义提示词"""
    success = config_manager.set_prompt(request.prompt_id, request.prompt_content)
    if success:
        return {"success": True, "message": "提示词已保存"}
    return {"success": False, "message": "保存失败"}

@app.get("/config/prompts")
async def get_all_prompts():
    """获取所有自定义提示词"""
    return config_manager.get_all_prompts()

@app.delete("/config/prompt/{prompt_id}")
async def delete_prompt(prompt_id: str):
    """删除自定义提示词"""
    success = config_manager.delete_prompt(prompt_id)
    if success:
        return {"success": True, "message": "提示词已删除"}
    return {"success": False, "message": "删除失败"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
