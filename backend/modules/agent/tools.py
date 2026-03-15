import json
from typing import Any


def retrieve_knowledge(query: str, top_k: int = 3) -> str:
    results = [
        {
            "title": f"Knowledge snippet {i + 1}",
            "content": f"Result for '{query}'",
            "score": round(1.0 - (i * 0.1), 2),
        }
        for i in range(max(1, top_k))
    ]
    return json.dumps({"query": query, "results": results}, ensure_ascii=False)


def generate_level_content(
    level_title: str,
    level_description: str,
    chapter_title: str,
    material: str,
    **_: Any,
) -> str:
    payload = {
        "narrative": (
            f"《{chapter_title}》- {level_title}\n"
            f"{level_description}\n"
            f"学习材料摘要：{material[:160]}"
        ),
        "images": [],
        "svg_animations": [],
        "quiz": [
            {
                "type": "single_choice",
                "question": f"{level_title} 的核心内容是什么？",
                "options": ["基础概念", "随机内容", "无关信息", "未知"],
                "answer": 0,
                "explanation": "根据学习材料和关卡描述，重点是基础概念。",
            }
        ],
    }
    return json.dumps(payload, ensure_ascii=False)

