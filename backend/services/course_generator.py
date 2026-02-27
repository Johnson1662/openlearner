import json
from typing import Dict, List, Any, Optional


class CourseGenerator:
    """课程大纲生成器"""
    
    def __init__(self, ai_provider):
        self.ai = ai_provider
    
    async def generate_outline(
        self,
        title: Optional[str],
        material: str,
        foundation: str = "beginner",
        goal: str = "interest",
        depth: str = "concept",
        pace: str = "steady",
        knowledge_context: str = ""
    ) -> Dict:
        """生成课程大纲"""
        
        foundation_text = {
            "beginner": "零基础 - 从最基础的概念开始讲解",
            "forgotten": "有基础但忘了 - 快速回顾后深入",
            "intermediate": "有一定基础 - 直接进入核心内容",
        }
        
        goal_text = {
            "exam": "应试导向 - 侧重考点和解题技巧",
            "work": "工作需要 - 注重实际应用",
            "interest": "纯粹兴趣 - 广度优先，轻松有趣",
            "foundation": "打牢基础 - 系统性，循序渐进",
        }
        
        depth_text = {
            "concept": "理解核心概念 - 掌握基本概念和原理",
            "skills": "掌握解题技巧 - 能够熟练运用解决问题",
            "原理": "深入原理 - 理解底层逻辑和高级应用",
        }
        
        pace_text = {
            "relaxed": "轻松入门 - 每天学习10-15分钟，内容精简",
            "steady": "稳步推进 - 每天学习20-30分钟，平衡深度和广度",
            "intensive": "高强度训练 - 每天学习45分钟以上，全面深入",
        }
        
        system_prompt = """你是一个课程设计专家。根据用户需求和材料生成个性化的课程大纲。
只输出有效JSON，不要输出其他内容。"""
        
        newline = chr(10)
        knowledge_section = f"参考知识库内容:{newline}{knowledge_context}" if knowledge_context else ""

        user_prompt = f"""请根据以下信息生成课程大纲：

{title if title else "请根据内容自动生成标题"}

学习材料:
{material[:3000]}

{knowledge_section}

用户基础: {foundation_text.get(foundation, foundation_text["beginner"])}
学习目标: {goal_text.get(goal, goal_text["interest"])}
学习深度: {depth_text.get(depth, depth_text["concept"])}
学习节奏: {pace_text.get(pace, pace_text["steady"])}

要求:
1. 生成3-5个章节
2. 每个章节包含2-4个关卡
3. 根据用户基础调整内容深浅
4. 根据学习目标侧重不同
5. 根据学习节奏调整内容总量
6. 每个关卡只需要title、description和xpReward

XP设置: {pace_text.get(pace, "60-120")}

输出格式 (必须是有效JSON):
{{"title":"标题","description":"描述","icon":"emoji","chapters":[{{"title":"章节","description":"描述","order":1}}],"levels":[{{"title":"关卡","description":"描述","order":1,"chapterIndex":0,"xpReward":100}}]}}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        
        response = self.ai.generate_completion(messages, {
            "temperature": 0.7,
            "max_tokens": 2000,
            "response_format": "json"
        })
        
        content = response.get("content", "")
        if not content:
            raise Exception("Failed to generate course outline")
        
        # 提取JSON
        json_str = self._extract_json(content)
        
        try:
            result = json.loads(json_str)
            return {
                "title": result.get("title", title or "未命名课程"),
                "description": result.get("description", "由AI生成的个性化课程"),
                "icon": result.get("icon", "📚"),
                "chapters": result.get("chapters", []),
                "levels": result.get("levels", []),
            }
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse course outline: {e}")
    
    def _extract_json(self, text: str) -> str:
        """从文本中提取JSON"""
        # 尝试从代码块中提取
        import re
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            return match.group(1)
        
        # 尝试直接提取
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            return text[start:end+1]
        
        return text
