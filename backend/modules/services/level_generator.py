import json
import re
import secrets

from logging_config import logger


class LevelGenerator:
    def __init__(self, provider):
        self.provider = provider

    @staticmethod
    def _extract_keywords(source_text: str, limit: int = 8) -> list[str]:
        candidates = re.findall(r"[\u4e00-\u9fffA-Za-z0-9_]{2,}", source_text or "")
        seen = set()
        keywords: list[str] = []
        for token in candidates:
            lower = token.lower()
            if lower in seen:
                continue
            seen.add(lower)
            keywords.append(token)
            if len(keywords) >= limit:
                break
        return keywords

    async def generate_content(
        self,
        level_title,
        level_description,
        chapter_title,
        material,
        knowledge_context="",
        difficulty="intermediate",
        depth="concept",
        user_context="",
        previous_answers=None,
        user_feedback="",
    ):
        source_text = (material or knowledge_context or "").strip()

        # Try AI-powered generation first
        if source_text and hasattr(self.provider, "generate_json"):
            try:
                steps = await self._generate_with_ai(
                    level_title=level_title,
                    level_description=level_description,
                    chapter_title=chapter_title,
                    material=source_text,
                    difficulty=difficulty,
                    depth=depth,
                    user_context=user_context,
                    previous_answers=previous_answers,
                    user_feedback=user_feedback,
                )
                if steps and len(steps) >= 2:
                    logger.info(f"AI-powered level content generation succeeded: {len(steps)} steps")
                    return steps
            except Exception as e:
                logger.warning(f"AI level generation failed, falling back to template: {e}")

        # Fallback to template-based generation
        logger.info("Using template-based level content generation")
        return self._generate_with_template(
            level_title=level_title,
            level_description=level_description,
            chapter_title=chapter_title,
            source_text=source_text,
            difficulty=difficulty,
            depth=depth,
            user_context=user_context,
            previous_answers=previous_answers,
            user_feedback=user_feedback,
        )

    async def _generate_with_ai(
        self,
        level_title,
        level_description,
        chapter_title,
        material,
        difficulty,
        depth,
        user_context,
        previous_answers,
        user_feedback,
    ) -> list[dict]:
        """Use AI to generate real educational content for a level."""

        difficulty_desc = {
            "beginner": "零基础入门，用简单语言和生活化例子解释",
            "intermediate": "有一定基础，可以引入专业术语和更复杂的例子",
            "advanced": "高阶学习者，深入原理、边界条件和高级应用",
        }
        depth_desc = {
            "concept": "重点放在概念理解和定义辨析",
            "application": "重点放在实际应用和问题求解",
            "mastery": "重点放在综合迁移和复杂场景分析",
        }

        # Truncate material to fit prompt
        material_for_prompt = material[:4000] if len(material) > 4000 else material

        # Build user context info
        user_info_parts = []
        if user_context:
            user_info_parts.append(user_context)
        if user_feedback:
            user_info_parts.append("用户反馈: " + user_feedback)
        if previous_answers:
            correct = sum(1 for a in previous_answers if a.get("isCorrect", False))
            total = len(previous_answers)
            user_info_parts.append("此前答题正确率: " + str(correct) + "/" + str(total))
        user_info = "\n".join(user_info_parts) if user_info_parts else "无额外信息"

        step_count = "3~4" if depth == "mastery" else "3"

        json_example = json.dumps({
            "steps": [
                {
                    "type": "narrative",
                    "title": "知识讲解标题",
                    "content": "详细的教学内容，包含概念解释、例子、公式等。支持 LaTeX 公式如 $F=ma$ 或 $$E=mc^2$$，支持 Markdown 加粗 **重点** 等格式。"
                },
                {
                    "type": "narrative",
                    "title": "深入理解标题",
                    "content": "进一步的解释、对比分析、应用场景等。"
                },
                {
                    "type": "quiz",
                    "title": "知识检测",
                    "question": "基于前面讲解的内容提出的问题",
                    "options": ["正确答案", "干扰项A", "干扰项B", "干扰项C"],
                    "answer": 0
                }
            ]
        }, ensure_ascii=False, indent=2)

        system_instruction = (
            "你是一个专业的教育内容生成器。你的任务是基于学习材料，为一个关卡生成真实的教学内容。"
            "你生成的内容必须是实际的知识讲解，而不是关于学习计划的描述。"
            "内容应该直接教授知识点，包含清晰的解释、具体的例子和应用。"
            "如果材料包含数学或科学内容，请使用 LaTeX 公式。"
            "请用中文回答，除非材料本身是英文的。"
        )

        diff_hint = difficulty_desc.get(difficulty, difficulty_desc["intermediate"])
        depth_hint = depth_desc.get(depth, depth_desc["concept"])

        prompt = (
            "请基于以下学习材料，为关卡生成真实的教学内容。\n\n"
            "## 关卡信息\n"
            "- 关卡标题: " + (level_title or "知识学习") + "\n"
            "- 关卡描述: " + (level_description or "掌握本关知识点") + "\n"
            "- 所属章节: " + (chapter_title or "当前章节") + "\n"
            "- 难度: " + diff_hint + "\n"
            "- 深度: " + depth_hint + "\n"
            "- 学习者信息: " + user_info + "\n\n"
            "## 学习材料\n"
            + material_for_prompt + "\n\n"
            "## 要求\n"
            "1. 生成 " + step_count + " 个步骤（steps）\n"
            "2. 前 1~2 个步骤是 narrative 类型，包含真实的知识讲解内容：\n"
            "   - 直接解释概念、原理、定义\n"
            "   - 给出具体的例子或类比\n"
            "   - 如果有数学公式，用 LaTeX 格式（行内用 $...$，独立公式用 $$...$$）\n"
            "   - 可以用 **加粗** 标记重点\n"
            "   - 内容要充实，每个 narrative 步骤至少 150 字\n"
            "3. 最后 1~2 个步骤是 quiz 类型，包含真正检测理解的选择题：\n"
            "   - 问题必须基于前面讲解的内容\n"
            "   - 选项要有区分度，干扰项应该是合理但错误的\n"
            "   - answer 字段是正确答案的索引（从 0 开始）\n"
            "4. 所有内容必须紧扣材料中与本关卡标题相关的知识点\n\n"
            "请严格按照以下 JSON 格式输出:\n"
            + json_example
        )

        response = self.provider.generate_json(
            prompt=prompt,
            system_instruction=system_instruction,
        )

        if not response or not isinstance(response, dict):
            raise ValueError("AI returned invalid response")

        steps = response.get("steps", [])
        if not steps:
            raise ValueError("AI response contains no steps")

        # Normalize the steps
        return self._normalize_ai_steps(steps)

    def _normalize_ai_steps(self, steps: list[dict]) -> list[dict]:
        """Normalize AI-generated steps to match expected format."""
        normalized = []
        for i, step in enumerate(steps):
            step_type = step.get("type", "narrative")

            if step_type == "narrative":
                normalized.append({
                    "type": "narrative",
                    "title": step.get("title", "知识讲解"),
                    "content": step.get("content", ""),
                })
            elif step_type == "quiz":
                options = step.get("options", [])
                answer = step.get("answer", 0)

                # Validate answer index
                if not isinstance(answer, int) or answer < 0 or answer >= len(options):
                    answer = 0

                normalized.append({
                    "type": "quiz",
                    "title": step.get("title", "知识检测"),
                    "question": step.get("question", ""),
                    "options": options,
                    "answer": answer,
                })
            else:
                # Treat unknown types as narrative
                normalized.append({
                    "type": "narrative",
                    "title": step.get("title", "学习内容"),
                    "content": step.get("content", ""),
                })

        return normalized

    def _generate_with_template(
        self,
        level_title,
        level_description,
        chapter_title,
        source_text,
        difficulty,
        depth,
        user_context,
        previous_answers,
        user_feedback,
    ) -> list[dict]:
        """Fallback template-based level content generation (original logic)."""
        keywords = self._extract_keywords(source_text, limit=8)

        steps = [
            {
                "type": "narrative",
                "title": level_title or "关卡导学",
                "content": self._build_focus_text(
                    level_title=level_title,
                    level_description=level_description,
                    chapter_title=chapter_title,
                    depth=depth,
                    source_text=source_text,
                    user_context=user_context,
                ),
                "meta": {
                    "difficulty": difficulty,
                    "depth": depth,
                    "user_context": user_context,
                    "user_feedback": user_feedback,
                    "previous_answers_count": len(previous_answers or []),
                },
            },
            {
                "type": "narrative",
                "title": "关键点拆解",
                "content": self._build_explain_text(
                    keywords=keywords,
                    difficulty=difficulty,
                    user_feedback=user_feedback,
                ),
            },
            self._build_quiz(
                level_title=level_title,
                source_text=source_text,
                keywords=keywords,
                previous_answers=previous_answers,
            ),
        ]

        if depth == "mastery":
            mastery_question = "如果要把\u201c" + (level_title or "本关主题") + "\u201d用于新场景，你会优先验证哪一步？"
            mastery_options = [
                "先确认关键前提是否成立",
                "直接套用旧答案",
                "跳过定义直接算结果",
                "只比较表面现象",
            ]
            steps.append(
                {
                    "type": "quiz",
                    "title": "进阶迁移题",
                    "question": mastery_question,
                    "options": mastery_options,
                    "answer": 0,
                }
            )

        return steps

    @staticmethod
    def _build_focus_text(
        level_title: str,
        level_description: str,
        chapter_title: str,
        depth: str,
        source_text: str,
        user_context: str,
    ) -> str:
        templates = [
            "本关聚焦于 {level_title}，目标是掌握关键概念并建立可迁移的理解框架。",
            "你将围绕 {level_title} 进行分层学习：先理解定义，再掌握应用场景。",
            "本关以 {level_title} 为核心，强调从原理到实践的连续理解。",
        ]
        depth_hint_map = {
            "concept": "重点放在概念辨析与核心定义。",
            "application": "重点放在如何把概念应用到真实问题。",
            "mastery": "重点放在综合迁移与复杂情境中的决策。",
        }
        intro = secrets.choice(templates).format(level_title=level_title or "当前主题")
        depth_hint = depth_hint_map.get(depth, depth_hint_map["concept"])
        material_excerpt = (source_text or "").strip()[:260]

        blocks = [
            "章节：" + (chapter_title or "当前章节"),
            "关卡：" + (level_title or "关卡内容"),
            "说明：" + (level_description or "通过练习掌握本关目标"),
            intro,
            depth_hint,
        ]
        if user_context:
            blocks.append("个性化学习提示：" + user_context.strip())
        if material_excerpt:
            blocks.append("材料要点摘录：" + material_excerpt)
        return "\n\n".join(blocks)

    @staticmethod
    def _build_explain_text(keywords: list[str], difficulty: str, user_feedback: str) -> str:
        difficulty_tips = {
            "beginner": "请先抓住术语含义与最小可用例子，不追求一次掌握全部细节。",
            "intermediate": "请关注概念之间的联系，尝试解释为什么这样设计。",
            "advanced": "请重点分析边界条件、隐含假设与可能的优化方向。",
        }
        lead_sentences = [
            "下面用结构化方式复盘本关关键点：",
            "接下来给你一个高效记忆框架：",
            "先把信息压缩成可操作的知识卡片：",
        ]
        key_text = "\u3001".join(keywords[:4]) if keywords else "核心概念、关键步骤、应用边界"
        feedback_note = "\n\n用户反馈参考：" + user_feedback if user_feedback else ""
        return (
            secrets.choice(lead_sentences) + "\n"
            "1) 关键词：" + key_text + "\n"
            "2) 理解路径：定义 \u2192 对比 \u2192 应用\n"
            "3) 自测建议：用一句话解释每个关键词的作用\n\n"
            + difficulty_tips.get(difficulty, difficulty_tips["intermediate"])
            + feedback_note
        )

    @staticmethod
    def _build_quiz(
        level_title: str,
        source_text: str,
        keywords: list[str],
        previous_answers: list[dict] | None,
    ) -> dict:
        topic_hint = " ".join((source_text or "").split()[:8]).strip() or "核心概念"
        correct = keywords[0] if keywords else topic_hint

        distractor_pool = [
            "无关细节",
            "随机内容",
            "无法判断",
            "与主题无直接关系",
            "只关注表面现象",
        ]
        if len(keywords) > 2:
            distractor_pool.append("仅记忆 " + keywords[1] + " 而忽略联系")
            distractor_pool.append("把 " + keywords[-1] + " 当作唯一结论")

        previous_count = len(previous_answers or [])
        if previous_count >= 3:
            question = "结合你此前答题表现，" + (level_title or "本关") + "最应优先巩固的是哪项？"
        else:
            question = "关于\u201c" + (level_title or "本关") + "\u201d，以下哪项最符合本关材料的核心主题？"

        distractors = list(dict.fromkeys(secrets.SystemRandom().sample(distractor_pool, k=3)))
        options = [correct, *distractors]
        answer_index = secrets.randbelow(len(options))
        if answer_index != 0:
            options[0], options[answer_index] = options[answer_index], options[0]
            answer_index = options.index(correct)

        return {
            "type": "quiz",
            "title": "知识小测",
            "question": question,
            "options": options,
            "answer": answer_index,
        }

    async def generate_content_stream(self, **kwargs):
        steps = await self.generate_content(**kwargs)
        total = len(steps)
        for idx, step in enumerate(steps, start=1):
            yield {
                "step": "generating",
                "progress": int((idx / total) * 100),
                "message": "正在生成关卡内容",
                "data": step,
            }
