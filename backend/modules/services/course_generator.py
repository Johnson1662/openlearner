import json
import re
import secrets

from logging_config import logger


class CourseGenerator:
    def __init__(self, provider):
        self.provider = provider

    @staticmethod
    def _extract_keywords(source_text: str, limit: int = 16) -> list[str]:
        tokens = re.findall(r"[\u4e00-\u9fffA-Za-z0-9_]{2,}", source_text or "")
        seen = set()
        keywords: list[str] = []
        for token in tokens:
            lower = token.lower()
            if lower in seen:
                continue
            seen.add(lower)
            keywords.append(token)
            if len(keywords) >= limit:
                break
        return keywords

    async def generate_outline(
        self,
        title=None,
        material="",
        foundation="beginner",
        goal="interest",
        depth="concept",
        pace="steady",
        knowledge_context="",
    ):
        source_text = (material or knowledge_context or "").strip()

        # Try AI-powered generation first
        if source_text and hasattr(self.provider, "generate_json"):
            try:
                result = await self._generate_with_ai(
                    title=title,
                    material=source_text,
                    foundation=foundation,
                    goal=goal,
                    depth=depth,
                    pace=pace,
                )
                if result and result.get("chapters") and result.get("levels"):
                    logger.info("AI-powered outline generation succeeded")
                    return result
            except Exception as e:
                logger.warning(f"AI outline generation failed, falling back to template: {e}")

        # Fallback to template-based generation
        logger.info("Using template-based outline generation")
        return self._generate_with_template(
            title=title,
            source_text=source_text,
            foundation=foundation,
            goal=goal,
            depth=depth,
            pace=pace,
        )

    async def _generate_with_ai(
        self,
        title,
        material,
        foundation,
        goal,
        depth,
        pace,
    ) -> dict:
        """Use AI to generate a course outline based on the actual material content."""

        difficulty_desc = {
            "beginner": "零基础入门，循序渐进",
            "intermediate": "有一定基础，从基础到进阶",
            "advanced": "高阶学习，深入核心问题",
        }
        goal_desc = {
            "interest": "兴趣探索，轻松有趣",
            "exam": "考试冲刺，重点突出",
            "professional": "职业能力提升，实战导向",
            "hobby": "兴趣实践，动手为主",
        }
        pace_desc = {
            "slow": "循序渐进，每个知识点充分展开",
            "steady": "稳步推进，平衡深度和广度",
            "fast": "快速通关，聚焦核心要点",
            "balanced": "均衡节奏",
            "thorough": "深入学习，不遗漏细节",
        }

        # Truncate material if too long (keep first ~6000 chars for prompt)
        material_for_prompt = material[:6000] if len(material) > 6000 else material

        system_instruction = (
            "你是一个专业的课程设计师。根据用户提供的学习材料，设计一个结构化的课程大纲。"
            "你必须严格基于材料内容来设计章节和关卡，确保大纲忠实反映材料中的主题和知识点。"
            "请用中文回答。"
        )

        json_example = json.dumps({
            "title": "课程标题（基于材料内容）",
            "description": "课程描述（概括材料核心内容和学习目标，1-2句话）",
            "chapters": [
                {
                    "id": "chapter-1",
                    "title": "章节标题（反映材料中的具体主题）",
                    "description": "章节描述（说明本章覆盖的知识点）",
                    "order": 1,
                }
            ],
            "levels": [
                {
                    "id": "level-1",
                    "chapterId": "chapter-1",
                    "title": "关卡标题（具体知识点）",
                    "description": "关卡描述（说明本关要掌握的内容）",
                    "order": 1,
                }
            ],
        }, ensure_ascii=False, indent=2)

        title_hint = title or "请根据材料内容自动生成一个合适的标题"
        diff_hint = difficulty_desc.get(foundation, "初学者")
        goal_hint = goal_desc.get(goal, "兴趣探索")
        pace_hint = pace_desc.get(pace, "稳步推进")

        prompt = (
            "请根据以下学习材料，生成一个结构化的课程大纲。\n\n"
            "## 学习材料内容\n"
            + material_for_prompt + "\n\n"
            "## 学习者信息\n"
            f"- 课程标题建议: {title_hint}\n"
            f"- 学习者水平: {diff_hint}\n"
            f"- 学习目标: {goal_hint}\n"
            f"- 学习节奏: {pace_hint}\n\n"
            "## 要求\n"
            "1. 仔细阅读材料内容，提取核心主题和知识点\n"
            "2. 根据材料的逻辑结构划分 2~5 个章节（chapter），每个章节对应材料中的一个主要主题\n"
            "3. 每个章节下设 2~4 个关卡（level），每个关卡聚焦一个具体知识点\n"
            "4. 章节和关卡的标题、描述必须与材料内容紧密相关，不要生成通用模板式内容\n"
            f"5. 难度必须是 {foundation}\n\n"
            "请严格按照以下 JSON 格式输出:\n"
            + json_example
        )

        response = self.provider.generate_json(
            prompt=prompt,
            system_instruction=system_instruction,
        )

        if not response or not isinstance(response, dict):
            raise ValueError("AI returned invalid response")

        # Validate and normalize the response
        return self._normalize_ai_response(response, foundation, goal, depth, pace)

    def _normalize_ai_response(self, response: dict, foundation: str, goal: str, depth: str, pace: str) -> dict:
        """Normalize the AI response to match the expected format."""
        rng = secrets.SystemRandom()

        course_title = response.get("title", "未命名课程")
        description = response.get("description", "")
        chapters = response.get("chapters", [])
        levels = response.get("levels", [])

        if not chapters or not levels:
            raise ValueError("AI response missing chapters or levels")

        # Normalize chapters
        for i, ch in enumerate(chapters):
            ch.setdefault("id", f"chapter-{i + 1}")
            ch.setdefault("order", i + 1)
            ch.setdefault("title", f"章节 {i + 1}")
            ch.setdefault("description", "")

        # Normalize levels
        for i, lv in enumerate(levels):
            lv.setdefault("id", f"level-{i + 1}")
            lv.setdefault("order", i + 1)
            lv.setdefault("title", f"关卡 {i + 1}")
            lv.setdefault("description", "")
            lv.setdefault("status", "available")
            lv.setdefault("xpReward", rng.choice([40, 50, 60, 70]))
            lv.setdefault("difficulty", foundation)
            lv.setdefault("goal", goal)
            lv.setdefault("depth", depth)
            lv.setdefault("pace", pace)

            # Make sure chapterId references an existing chapter
            if lv.get("chapterId") not in [ch["id"] for ch in chapters]:
                lv["chapterId"] = chapters[0]["id"] if chapters else "chapter-1"

        return {
            "title": course_title,
            "description": description,
            "icon": rng.choice(["📘", "🧠", "🚀", "🎯", "📚"]),
            "lessons": len(levels),
            "exercises": len(levels),
            "progress": 0,
            "chapters": chapters,
            "levels": levels,
        }

    def _generate_with_template(
        self,
        title,
        source_text,
        foundation,
        goal,
        depth,
        pace,
    ) -> dict:
        """Fallback template-based outline generation (original logic)."""
        keywords = self._extract_keywords(source_text, limit=18)
        rng = secrets.SystemRandom()

        course_title = title or (f"{keywords[0]} 学习路径" if keywords else "未命名课程")
        difficulty_desc = {
            "beginner": "从零基础入门",
            "intermediate": "从基础到实战进阶",
            "advanced": "面向高阶问题求解",
        }
        goal_desc = {
            "interest": "兴趣探索",
            "exam": "考试冲刺",
            "professional": "职业能力提升",
            "hobby": "兴趣实践",
        }
        depth_desc = {
            "concept": "概念理解",
            "application": "应用实践",
            "mastery": "综合掌握",
        }
        pace_desc = {
            "slow": "循序渐进",
            "steady": "稳步推进",
            "fast": "快速通关",
            "balanced": "均衡节奏",
            "thorough": "深入学习",
        }

        chapter_count = 3 if len(keywords) >= 6 else 2
        if len(keywords) >= 12 and rng.random() > 0.45:
            chapter_count = 4

        chapter_name_templates = [
            "{kw} 基础认知",
            "{kw} 核心原理",
            "{kw} 应用场景",
            "{kw} 实战案例",
            "{kw} 进阶挑战",
        ]
        level_name_templates = [
            "理解 {kw}",
            "{kw} 概念辨析",
            "{kw} 场景应用",
            "{kw} 题型训练",
            "{kw} 综合小测",
        ]

        chapters = []
        levels = []
        level_order = 1

        for chapter_index in range(chapter_count):
            chapter_id = f"chapter-{chapter_index + 1}"
            keyword = keywords[chapter_index] if chapter_index < len(keywords) else f"主题{chapter_index + 1}"
            chapter_title = rng.choice(chapter_name_templates).format(kw=keyword)
            chapters.append(
                {
                    "id": chapter_id,
                    "title": chapter_title,
                    "description": "围绕\u201c" + keyword + "\u201d建立从理解到应用的知识闭环。",
                    "order": chapter_index + 1,
                }
            )

            level_count = 2 if chapter_index < chapter_count - 1 else 3
            for _ in range(level_count):
                level_kw = keywords[level_order - 1] if (level_order - 1) < len(keywords) else keyword
                level_title = rng.choice(level_name_templates).format(kw=level_kw)
                levels.append(
                    {
                        "id": f"level-{level_order}",
                        "chapterId": chapter_id,
                        "title": level_title,
                        "description": "聚焦\u201c" + level_kw + "\u201d，完成概念理解与可迁移应用。",
                        "status": "available",
                        "xpReward": rng.choice([40, 50, 60, 70]),
                        "difficulty": foundation,
                        "goal": goal,
                        "depth": depth,
                        "pace": pace,
                        "order": level_order,
                    }
                )
                level_order += 1

        description_parts = [
            difficulty_desc.get(foundation, "面向系统化学习"),
            goal_desc.get(goal, "目标导向"),
            depth_desc.get(depth, "层次学习"),
            pace_desc.get(pace, "稳步学习"),
        ]
        description = f"{course_title}：{'，'.join(description_parts)}。"
        if keywords:
            description += f" 重点覆盖：{'、'.join(keywords[: min(6, len(keywords))])}。"

        return {
            "title": course_title,
            "description": description,
            "icon": rng.choice(["📘", "🧠", "🚀", "🎯", "📚"]),
            "lessons": len(levels),
            "exercises": len(levels),
            "progress": 0,
            "chapters": chapters,
            "levels": levels,
        }
