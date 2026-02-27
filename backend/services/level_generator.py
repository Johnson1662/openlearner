import json
import re
from typing import Dict, List, Any, Optional


class LevelGenerator:
    """关卡内容生成器"""
    
    def __init__(self, ai_provider):
        self.ai = ai_provider
    
    async def generate_content(
        self,
        level_title: str,
        level_description: str,
        chapter_title: str,
        material: str,
        knowledge_context: str = "",
        difficulty: str = "intermediate",
        user_context: str = "",
        previous_answers: List[Dict] = None,
        user_feedback: str = None
    ) -> List[Dict]:
        """生成关卡内容 - 支持上下文感知"""
        
        if previous_answers is None:
            previous_answers = []
        
        difficulty_label = {
            "beginner": "初级",
            "intermediate": "中级",
            "advanced": "高级"
        }.get(difficulty, "中级")
        
        system_prompt = """你是一个JSON生成器。只输出有效JSON，不要输出其他内容。
JSON中的文字必须是干净的UTF-8中文，不要有转义字符或HTML实体。"""
        
        # 构建上下文感知提示
        context_section = ""
        if user_context:
            context_section += f"\n用户学习上下文:\n{user_context}\n"
        
        # 分析用户答题表现
        if previous_answers and len(previous_answers) > 0:
            correct_count = sum(1 for a in previous_answers if a.get("isCorrect", False) or a.get("is_correct", False))
            total_count = len(previous_answers)
            accuracy = (correct_count / total_count * 100) if total_count > 0 else 0
            
            context_section += f"\n用户最近答题表现: {correct_count}/{total_count} 正确 ({accuracy:.0f}% 正确率)\n"
            
            if accuracy < 50:
                context_section += "注意: 用户正确率较低，需要更详细地解释概念，题目可以稍微简单一些\n"
            elif accuracy > 80:
                context_section += "注意: 用户正确率很高，可以增加一些有挑战性的题目\n"
        
        # 分析用户反馈
        if user_feedback:
            if "太难" in user_feedback or "too_hard" in user_feedback.lower():
                context_section += "用户反馈: 内容偏难，需要适当简化解释\n"
            elif "太简单" in user_feedback or "too_easy" in user_feedback.lower():
                context_section += "用户反馈: 内容偏简单，可以增加深度\n"
            else:
                context_section += f"用户反馈: {user_feedback}\n"
        
        user_prompt = f"""生成{difficulty_label}难度的学习关卡JSON。

关卡标题：{level_title}
关卡描述：{level_description}
章节标题：{chapter_title}

{context_section}
学习材料（重点根据此材料出题）：
{material[:2000]}

{f"参考知识库内容:\n{knowledge_context}" if knowledge_context else ""}

要求：
1. 关卡内容必须与关卡标题和材料相关
2. 每个关卡包含2-3个steps
3. steps必须包含info和quiz类型
4. quiz使用multiple_choice格式
5. 确保每个关卡内容独特，与其他关卡不重复
6. 根据用户的答题表现和反馈调整内容难度和深度

输出格式（必须是干净的有效JSON）：
{{"steps":[{{"id":"s1","type":"info","title":"标题","content":"内容"}},{{"id":"s2","type":"multiple_choice","title":"标题","question":"问题","options":[{{"id":"a","text":"选项A","isCorrect":true}},{{"id":"b","text":"选项B","isCorrect":false}}],"hint":"提示"}}]}}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        
        response = self.ai.generate_completion(messages, {
            "temperature": 0.7,
            "max_tokens": 4000,
            "response_format": "json"
        })
        
        content = response.get("content", "")
        if not content:
            raise Exception("Failed to generate level content")
        
        # 提取JSON
        json_str = self._extract_json(content)
        
        try:
            result = json.loads(json_str)
            return result.get("steps", [])
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse level content: {e}")
    
    def _extract_json(self, text: str) -> str:
        """从文本中提取JSON"""
        # 尝试从代码块中提取
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if match:
            json_str = match.group(1)
            # 清理Unicode转义
            json_str = self._clean_unicode(json_str)
            return json_str
        
        # 尝试直接提取
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            json_str = text[start:end+1]
            json_str = self._clean_unicode(json_str)
            return json_str
        
        return text
    
    def _clean_unicode(self, text: str) -> str:
        """清理Unicode转义"""
        # 解码 \uXXXX
        text = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), text)
        # 清理转义字符
        text = text.replace('\\n', '\n').replace('\\r', '\r').replace('\\t', '\t')
        return text
