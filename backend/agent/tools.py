"""Custom tools for Learning Guide Agent."""
from typing import Optional, List, Dict, Any
from google.adk.tools import FunctionTool
import json


def generate_level_content(
    level_title: str,
    level_description: str,
    chapter_title: str,
    material: str,
    difficulty: str = "intermediate",
    knowledge_context: str = "",
    user_context: str = "",
) -> str:
    """
    Generate learning level content with quiz.
    
    Args:
        level_title: Title of the level
        level_description: Description of what to learn
        chapter_title: Parent chapter title
        material: Source learning material
        difficulty: beginner, intermediate, or advanced
        knowledge_context: Retrieved context from knowledge base
        user_context: User's learning history and feedback
    
    Returns:
        JSON string with narrative, images (placeholder), and quiz
    """
    import sys
    import os
    agent_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(agent_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from services.ai_provider import get_provider

    difficulty_label = {
        "beginner": "初级",
        "intermediate": "中级",
        "advanced": "高级"
    }.get(difficulty, "中级")

    prompt = f"""生成{difficulty_label}难度的学习内容。

标题: {level_title}
描述: {level_description}
章节: {chapter_title}

学习材料:
{material[:1000]}

{knowledge_context}

{user_context}

要求:
1. 用现实生活中的例子引入主题
2. 解释核心概念
3. 包含一道选择题测验

返回JSON格式:
{{"narrative": "...", "images": [], "svg_animations": [], "quiz": {{"question": "...", "options": [...], "hint": "..."}}}}"""

    try:
        ai = get_provider()
        response = ai.generate_completion(
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.7, "response_format": "json"}
        )

        content = response.get("content", "{}")
        try:
            data = json.loads(content)
            return json.dumps(data)
        except json.JSONDecodeError:
            return json.dumps({
                "narrative": content,
                "images": [],
                "svg_animations": [],
                "quiz": None
            })
    except Exception as e:
        return json.dumps({
            "narrative": f"内容生成失败: {str(e)}",
            "images": [],
            "svg_animations": [],
            "quiz": None
        })


def retrieve_knowledge(query: str, top_k: int = 3) -> str:
    """
    Retrieve relevant knowledge from the knowledge base.
    
    Args:
        query: Search query
        top_k: Number of results to return
    
    Returns:
        JSON string with retrieved documents
    """
    import sys
    import os
    agent_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(agent_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    try:
        from knowledge.retriever import retriever
        results = retriever.vectorstore.similarity_search(query, top_k=top_k)
        return json.dumps({"results": results, "count": len(results)})
    except Exception as e:
        return json.dumps({"error": str(e), "results": []})


def save_user_progress(
    user_id: str,
    course_id: str,
    level_id: str,
    status: str,
    xp_earned: int = 0,
) -> str:
    """
    Save user's learning progress to database.
    
    Args:
        user_id: User identifier
        course_id: Course identifier
        level_id: Level identifier
        status: completed, in_progress, etc.
        xp_earned: Experience points earned
    
    Returns:
        JSON string with save confirmation
    """
    # This will be implemented in Task 1.4 - just return placeholder now
    pass


# Create FunctionTool instances
generate_level_content_tool = FunctionTool(generate_level_content)
retrieve_knowledge_tool = FunctionTool(retrieve_knowledge)
save_user_progress_tool = FunctionTool(save_user_progress)

TOOLS = [
    generate_level_content_tool,
    retrieve_knowledge_tool,
    save_user_progress_tool,
]