from fastapi import FastAPI, UploadFile, File, Form, Request
from typing import Optional, Union, Any
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette import EventSourceResponse
import json
import asyncio
import os
import sys

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from modules.agent.learning_guide import AGENT_CONFIG



from config import HOST, PORT
from logging_config import logger
from modules.services.ai_provider import get_provider
from modules.services.course_generator import CourseGenerator
from modules.services.level_generator import LevelGenerator
from modules.knowledge import DocumentLoader, knowledge_base, retriever
from modules.database import db

app = FastAPI(title="OpenLearner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8003', 'http://127.0.0.1:8003'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
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
        try:
            yield {"event": "status", "data": json.dumps({"status": "starting"})}
            provider = get_provider()
            messages = [
                {"role": "system", "content": AGENT_CONFIG["instruction"]},
                {"role": "user", "content": message}
            ]
            
            # Note: Current implementation is simple replacement of ADK Runner.
            # Direct Gemini API handling thinking and text content.
            stream = provider.generate_stream(
                messages=messages, 
                options={"tools": AGENT_CONFIG["tools"]}
            )
            
            for chunk in stream:
                if not chunk.candidates:
                    continue
                
                for part in chunk.candidates[0].content.parts:
                    if hasattr(part, 'thought') and part.thought:
                        yield {"event": "thinking", "data": part.thought}
                    
                    if hasattr(part, 'text') and part.text:
                        yield {"event": "content", "data": part.text}
                    
                    if hasattr(part, 'call') and part.call:
                        # Handle tool call
                        tool_name = part.call.name
                        tool_args = part.call.args
                        yield {"event": "tool_call", "data": json.dumps({
                            "tool": tool_name,
                            "input": tool_args,
                        })}

            yield {"event": "done", "data": json.dumps({"status": "complete"})}
        except Exception as e:
            logger.error(f"Agent stream error: {str(e)}", exc_info=True)
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
            foundation: str = str(body.get("foundation") or body.get("priorKnowledge") or "beginner")
            goal: str = str(body.get("goal") or body.get("learningGoal") or "interest")
            depth: str = str(body.get("depth", "concept"))
            pace: str = str(body.get("pace") or body.get("learningPacing") or "steady")
            file: Optional[UploadFile] = File(None)
        else:
            form = await request.form()
            material = form.get("material", "")
            title = form.get("title", "")
            materialUrl = form.get("materialUrl", "")
            foundation = form.get("foundation") or form.get("priorKnowledge") or "beginner"
            goal = form.get("goal") or form.get("learningGoal") or "interest"
            depth = form.get("depth", "concept")
            pace = form.get("pace") or form.get("learningPacing") or "steady"
            # 文件上传需要特殊处理
            file = form.get("file")
        
        # 处理材料
        material_content = material
        
        # 处理文件上传
        if file and hasattr(file, 'read'):
            file_content = await file.read()
            file_type = file.filename.split('.')[-1] if '.' in file.filename else 'text'
            material_content = document_loader.load(file_content, file_type)
        # 处理URL
        elif materialUrl:
            logger.info(f"Loading from URL: {materialUrl}")
            material_content = document_loader.load(materialUrl, 'url')
        
        if not material_content or (isinstance(material_content, str) and len(material_content) < 10):
            logger.warning("No valid material provided!")
            return {"success": False, "error": "请提供学习材料或上传文件"}
        
        logger.info(f"Material content loaded: {len(material_content)} chars")
        
        # 检索知识库
        knowledge_context = ""
        if retriever is not None:
            knowledge_context = retriever.retrieve_for_course(
                topic=title or "学习内容",
                course_title=title
            )
        
        # 添加到知识库
        if material_content and isinstance(material_content, str):
            if knowledge_base is not None:
                knowledge_base.add_documents(
                    [str(material_content)],
                    [{"type": "course_material", "title": str(title) or "未命名"}]
                )
        
        _, course_gen, _ = get_services()
        
        # 生成课程
        logger.info("Calling course generator...")
        if course_gen is None: raise ValueError("Course generator not initialized")
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
        
        # 保存课程到数据库
        course_id = db.save_course(course, material_content)
        course["id"] = course_id
        
        return {"success": True, "data": {"course": course}}
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error generating course: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}

def transform_course(db_course: dict) -> dict:
    """Transform database course to frontend format"""
    return {
        "id": db_course.get("id"),
        "title": db_course.get("title"),
        "description": db_course.get("description"),
        "icon": db_course.get("icon", "📚"),
        "thumbnail": db_course.get("thumbnail"),
        "coverImage": db_course.get("cover_image"),
        "lessons": db_course.get("lessons", 0),
        "exercises": db_course.get("exercises", 0),
        "progress": db_course.get("progress", 0),
        "createdAt": db_course.get("created_at"),
        "lastAccessedAt": db_course.get("last_accessed_at"),
        "chapters": [],
        "levels": []
    }

@app.get("/api/courses")
async def get_courses():
    """Get all courses from database"""
    try:
        conn = db.get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses ORDER BY last_accessed_at DESC")
        courses = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"success": True, "data": [transform_course(c) for c in courses]}
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    """Get course details from database"""
    try:
        details = db.get_course_with_details(course_id)
        if not details:
            return {"success": False, "error": "Course not found"}
        return {"success": True, "data": details}
    except Exception as e:
        logger.error(f"Error fetching course details: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}


@app.post("/api/admin/clear-level-content")
async def clear_level_content():
    """Clear all generated level content."""
    try:
        result = db.clear_all_generated_level_content()
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error clearing level content: {str(e)}", exc_info=True)
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
            depth = body.get("depth", "concept")
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
            depth = form.get("depth", "concept")
            material = form.get("material", "")
            userId = form.get("userId", "user-1")
            previousAnswers = []
            userFeedback = form.get("userFeedback", "")
        
        logger.info(f"Request: courseId={courseId}, levelId={levelId}, levelTitle={levelTitle}, difficulty={difficulty}")
        logger.info(f"User context: userId={userId}, previousAnswers={len(previousAnswers)}, userFeedback={userFeedback}")
        
        # If frontend didn't pass material, load it from DB using courseId
        if not material and courseId:
            logger.info(f"No material in request, loading from DB for courseId={courseId}")
            material = get_course_material_from_db(courseId)
            if material and material.startswith("Error loading material:"):
                logger.warning(f"Failed to load material from DB: {material}")
                material = ""
            elif material == "No material available":
                material = ""
        
        _, _, level_gen = get_services()
        
        # 检索知识库
        knowledge_context = ""
        if retriever is not None:
            knowledge_context = retriever.retrieve_for_level(
                level_title=levelTitle,
                chapter_title=chapterTitle,
                course_title=""
            )
        
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
        if level_gen is None: raise ValueError("Level generator not initialized")
        steps = await level_gen.generate_content(
            level_title=levelTitle,
            level_description=levelDescription,
            chapter_title=chapterTitle,
            material=material,
            knowledge_context=knowledge_context,
            difficulty=difficulty,
            depth=depth,
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
async def generate_level_stream(course_id: str, level_id: str, level_title: str = "", depth: str = "concept"):
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
            
            knowledge_context = ""
            if retriever is not None:
                knowledge_context = retriever.retrieve_for_level(level_title=level_title)
            
            # Step 3: 流式生成内容
            if level_gen is None: raise ValueError("Level generator not initialized")
            
            async for step_data in level_gen.generate_content_stream(
                level_title=level_title,
                level_description="关卡描述",
                chapter_title="章节标题",
                material=material,
                knowledge_context=knowledge_context,
                depth=depth
            ):
                yield {
                    "event": "step",
                    "data": json.dumps(step_data)
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


@app.post("/ai/parse-material")
async def parse_material(request: Request):
    """解析 PDF 或 URL 材料"""
    logger.info("=== POST /ai/parse-material ===")
    try:
        content_type = request.headers.get("content-type", "")
        
        # 文件上传
        if "multipart/form-data" in content_type:
            form = await request.form()
            file = form.get("file")
            
            if file and hasattr(file, 'read') and not isinstance(file, str):
                file_content = await file.read()
                file_type = file.filename.split('.')[-1].lower() if '.' in file.filename else 'text'
                logger.info(f"Parsing uploaded file: {file.filename}, type: {file_type}")
                
                content = document_loader.load(file_content, file_type)
                return {"success": True, "data": {"content": content, "filename": file.filename}}
            
            return {"success": False, "error": "未找到上传文件"}
        
        # JSON 请求 (URL)
        body = await request.json()
        url = body.get("url", "")
        
        if url:
            logger.info(f"Parsing URL: {url}")
            content = document_loader.load(url, 'url')
            return {"success": True, "data": {"content": content, "url": url}}
        
        return {"success": False, "error": "请提供 URL 或上传文件"}
        
    except Exception as e:
        logger.error(f"Error parsing material: {str(e)}", exc_info=True)
        return {"success": False, "error": str(e)}




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
