from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette import EventSourceResponse
import json
import asyncio
from agent.learning_guide import learning_guide_agent
from google.adk import Runner

from config import HOST, PORT
from logging_config import logger
from services.ai_provider import get_provider
from services.course_generator import CourseGenerator
from services.level_generator import LevelGenerator
from knowledge import DocumentLoader, knowledge_base, retriever

app = FastAPI(title="OpenLearner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_provider = None
course_generator = None
level_generator = None
document_loader = DocumentLoader()


def get_services():
    global ai_provider, course_generator, level_generator
    if ai_provider is None:
        ai_provider = get_provider()
        course_generator = CourseGenerator(ai_provider)
        level_generator = LevelGenerator(ai_provider)
    return ai_provider, course_generator, level_generator


@app.get("/health")
async def health():
    return {"status": "healthy"}




@app.get("/agent/stream/{session_id}")
async def agent_stream(session_id: str, message: str = "", user_id: str = "user-1"):
    """Stream agent thinking and responses via SSE."""

    async def event_generator():
        runner = Runner(agent=learning_guide_agent)

        try:
            # Send initial status
            yield {"event": "status", "data": json.dumps({"status": "starting"})}

            # Run agent and stream events
            async for event in runner.run_live(
                user_id=user_id,
                session_id=session_id,
                new_message=message
            ):
                # Extract thinking and tool calls
                if hasattr(event, 'thinking'):
                    yield {"event": "thinking", "data": event.thinking}

                if hasattr(event, 'tool_name'):
                    yield {"event": "tool_call", "data": json.dumps({
                        "tool": event.tool_name,
                        "input": event.tool_input,
                    })}

                if hasattr(event, 'content'):
                    yield {"event": "content", "data": event.content}

            yield {"event": "done", "data": json.dumps({"status": "complete"})}

        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())

@app.post("/ai/generate-course")
async def generate_course(request: Request):
    """生成课程大纲 - 支持 JSON 和 Form 数据"""
    logger.info("=== POST /ai/generate-course ===")
    try:
        # 尝试获取 JSON body
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            body = await request.json()
            material = body.get("material", "")
            title = body.get("title", "")
            materialUrl = body.get("materialUrl", "")
            foundation = body.get("foundation", "beginner")
            goal = body.get("goal", "interest")
            depth = body.get("depth", "concept")
            pace = body.get("pace", "steady")
            file = None
        else:
            form = await request.form()
            material = form.get("material", "")
            title = form.get("title", "")
            materialUrl = form.get("materialUrl", "")
            foundation = form.get("foundation", "beginner")
            goal = form.get("goal", "interest")
            depth = form.get("depth", "concept")
            pace = form.get("pace", "steady")
            file = None
        
        logger.info(f"Request: title={title}, foundation={foundation}, goal={goal}, depth={depth}, pace={pace}")
        logger.info(f"Material length: {len(material) if material else 0} chars")
        
        _, course_gen, _ = get_services()
        
        # 处理材料
        material_content = material
        
        # 处理文件上传
        if file:
            file_content = await file.read()
            file_type = file.filename.split('.')[-1] if '.' in file.filename else 'text'
            material_content = document_loader.load(file_content, file_type)
        
        # 处理URL
        elif materialUrl:
            logger.info(f"Loading from URL: {materialUrl}")
            material_content = document_loader.load(materialUrl, 'url')
        
        if not material_content or len(material_content) < 10:
            logger.warning("No valid material provided!")
            return {"success": False, "error": "请提供学习材料或上传文件"}
        
        logger.info(f"Material content loaded: {len(material_content)} chars")
        
        # 检索知识库
        knowledge_context = retriever.retrieve_for_course(
            topic=title or "学习内容",
            course_title=title
        )
        logger.info(f"Retrieved knowledge context: {len(knowledge_context) if knowledge_context else 0} chars")
        
        # 添加到知识库
        if material_content:
            knowledge_base.add_documents(
                [material_content],
                [{"type": "course_material", "title": title or "未命名"}]
            )
        
        # 生成课程
        logger.info("Calling course generator...")
        course = await course_gen.generate_outline(
            title=title or None,
            material=material_content,
            foundation=foundation,
            goal=goal,
            depth=depth,
            pace=pace,
            knowledge_context=knowledge_context
        )
        
        logger.info(f"Course generated successfully: {course.get('title', 'unknown')}")
        return {"success": True, "data": {"course": course}}
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error generating course: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}


@app.post("/ai/generate-level")
async def generate_level(request: Request):
    """生成关卡内容 - 支持 JSON 和 Form 数据 - 完整上下文感知"""
    logger.info("=== POST /ai/generate-level ===")
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            body = await request.json()
            courseId = body.get("courseId", "")
            levelId = body.get("levelId", "")
            levelTitle = body.get("levelTitle", "")
            levelDescription = body.get("levelDescription", "")
            chapterTitle = body.get("chapterTitle", "")
            difficulty = body.get("difficulty", "intermediate")
            material = body.get("material", "")
            userId = body.get("userId", "user-1")
            previousAnswers = body.get("previousAnswers", [])
            userFeedback = body.get("userFeedback", "")
        else:
            form = await request.form()
            courseId = form.get("courseId", "")
            levelId = form.get("levelId", "")
            levelTitle = form.get("levelTitle", "")
            levelDescription = form.get("levelDescription", "")
            chapterTitle = form.get("chapterTitle", "")
            difficulty = form.get("difficulty", "intermediate")
            material = form.get("material", "")
            userId = form.get("userId", "user-1")
            previousAnswers = []
            userFeedback = form.get("userFeedback", "")
        
        logger.info(f"Request: courseId={courseId}, levelId={levelId}, levelTitle={levelTitle}, difficulty={difficulty}")
        logger.info(f"User context: userId={userId}, previousAnswers={len(previousAnswers)}, userFeedback={userFeedback}")
        
        _, _, level_gen = get_services()
        
        # 检索知识库
        knowledge_context = retriever.retrieve_for_level(
            level_title=levelTitle,
            chapter_title=chapterTitle,
            course_title=""
        )
        logger.info(f"Retrieved knowledge context: {len(knowledge_context) if knowledge_context else 0} chars")
        
        # 构建用户上下文信息（前端已经传过来了）
        user_context = ""
        
        # 分析答题表现
        if previousAnswers and len(previousAnswers) > 0:
            correct = sum(1 for a in previousAnswers if a.get("isCorrect", False))
            total = len(previousAnswers)
            accuracy = (correct / total * 100) if total > 0 else 0
            user_context += f"答题正确率: {accuracy:.0f}% ({correct}/{total})\n"
            
            # 根据正确率调整难度建议
            if accuracy < 50:
                user_context += "难度建议: 需要更基础的内容\n"
            elif accuracy > 80:
                user_context += "难度建议: 可以接受更有挑战性的内容\n"
        
        # 处理用户反馈
        if userFeedback:
            if "太难" in userFeedback:
                user_context += "用户反馈: 内容偏难\n"
            elif "太简单" in userFeedback:
                user_context += "用户反馈: 内容偏简单\n"
            else:
                user_context += f"用户反馈: {userFeedback}\n"
        
        # 生成关卡内容 - 传递完整上下文
        logger.info("Calling level generator with context awareness...")
        steps = await level_gen.generate_content(
            level_title=levelTitle,
            level_description=levelDescription,
            chapter_title=chapterTitle,
            material=material,
            knowledge_context=knowledge_context,
            difficulty=difficulty,
            user_context=user_context,
            previous_answers=previousAnswers,
            user_feedback=userFeedback
        )
        
        logger.info(f"Level generated successfully: {len(steps)} steps")
        return {"success": True, "data": {"steps": steps}}
    
    except Exception as e:
        logger.error(f"Error generating level: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}



def get_course_material_from_db(course_id: str) -> str:
    """Get course material from SQLite database."""
    import sqlite3
    import os
    
    # Get the database path - go up from api/ to backend/ to project root
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(backend_dir, "data", "openlearner.db")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.execute(
            "SELECT material FROM course_materials WHERE course_id = ?",
            (course_id,)
        )
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else "No material available"
    except Exception as e:
        return f"Error loading material: {str(e)}"

@app.get("/ai/generate-level/stream/{course_id}/{level_id}")
async def generate_level_stream(course_id: str, level_id: str, level_title: str = ""):
    """SSE 流式生成关卡"""
    
    async def event_generator():
        try:
            _, _, level_gen = get_services()
            
            # Step 1: 加载材料
            yield {
                "event": "step",
                "data": json.dumps({
                    "step": "loading",
                    "message": "正在加载学习材料...",
                    "progress": 10
                })
            }
            await asyncio.sleep(0.5)
            
            material = get_course_material_from_db(course_id)
            
            # Step 2: 检索知识库
            yield {
                "event": "step",
                "data": json.dumps({
                    "step": "retrieving",
                    "message": "正在检索知识库...",
                    "progress": 30
                })
            }
            await asyncio.sleep(0.5)
            
            knowledge_context = retriever.retrieve_for_level(level_title=level_title)
            
            # Step 3: 生成内容
            yield {
                "event": "step",
                "data": json.dumps({
                    "step": "generating",
                    "message": "AI 正在生成关卡内容...",
                    "progress": 60
                })
            }
            
            steps = await level_gen.generate_content(
                level_title=level_title,
                level_description="关卡描述",
                chapter_title="章节标题",
                material=material,
                knowledge_context=knowledge_context
            )
            
            # Step 4: 完成
            yield {
                "event": "step",
                "data": json.dumps({
                    "step": "complete",
                    "message": "关卡生成完成！",
                    "progress": 100
                })
            }
            
            # 发送内容
            yield {
                "event": "content",
                "data": json.dumps({"steps": steps})
            }
            
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"message": str(e)})
            }
    
    return EventSourceResponse(event_generator())


@app.post("/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...), user_id: str = Form("user-1")):
    """上传文档到知识库"""
    try:
        file_content = await file.read()
        file_type = file.filename.split('.')[-1] if '.' in file.filename else 'text'
        
        content = document_loader.load(file_content, file_type)
        
        doc_ids = knowledge_base.add_documents(
            [content],
            [{"user_id": user_id, "filename": file.filename}]
        )
        
        return {"success": True, "doc_ids": doc_ids}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/knowledge/search")
async def search_knowledge(q: str, user_id: str = "user-1"):
    """检索知识库"""
    try:
        results = knowledge_base.similarity_search(q, top_k=5)
        return {"success": True, "results": results}
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
