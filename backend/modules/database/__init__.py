import json
import os
import sqlite3
import uuid
from datetime import datetime


class DB:
    def __init__(self):
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_dir = os.path.join(backend_root, "data")
        os.makedirs(data_dir, exist_ok=True)
        self.db_path = os.path.join(data_dir, "openlearner.db")
        self._init_schema()

    def get_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self):
        conn = self.get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS courses (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                icon TEXT,
                thumbnail TEXT,
                cover_image TEXT,
                lessons INTEGER DEFAULT 0,
                exercises INTEGER DEFAULT 0,
                progress INTEGER DEFAULT 0,
                created_at TEXT,
                last_accessed_at TEXT
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS course_materials (
                course_id TEXT PRIMARY KEY,
                material TEXT
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS course_details (
                course_id TEXT PRIMARY KEY,
                chapters_json TEXT,
                levels_json TEXT
            )
            """
        )
        conn.commit()
        conn.close()

    def save_course(self, course: dict, material: str):
        conn = self.get_db()
        cursor = conn.cursor()
        course_id = course.get("id") or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        cursor.execute(
            """
            INSERT OR REPLACE INTO courses
            (id, title, description, icon, thumbnail, cover_image, lessons, exercises, progress, created_at, last_accessed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                course_id,
                course.get("title"),
                course.get("description"),
                course.get("icon"),
                course.get("thumbnail"),
                course.get("coverImage"),
                course.get("lessons", 0),
                course.get("exercises", 0),
                course.get("progress", 0),
                course.get("createdAt") or now,
                now,
            ),
        )
        cursor.execute(
            "INSERT OR REPLACE INTO course_materials (course_id, material) VALUES (?, ?)",
            (course_id, material or ""),
        )
        cursor.execute(
            "INSERT OR REPLACE INTO course_details (course_id, chapters_json, levels_json) VALUES (?, ?, ?)",
            (
                course_id,
                json.dumps(course.get("chapters", []), ensure_ascii=False),
                json.dumps(course.get("levels", []), ensure_ascii=False),
            ),
        )
        conn.commit()
        conn.close()
        return course_id

    def get_course_with_details(self, course_id: str):
        conn = self.get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
        row = cursor.fetchone()
        cursor.execute("SELECT chapters_json, levels_json FROM course_details WHERE course_id = ?", (course_id,))
        details_row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        course = dict(row)
        chapters = []
        levels = []
        if details_row:
            chapters = json.loads(details_row["chapters_json"] or "[]")
            levels = json.loads(details_row["levels_json"] or "[]")
        return {"course": course, "chapters": chapters, "levels": levels}

    def clear_all_generated_level_content(self):
        conn = self.get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT course_id, levels_json FROM course_details")
        rows = cursor.fetchall()

        levels_cleared = 0
        cache_entries_cleared = 0

        for row in rows:
            raw_levels = row["levels_json"] or "[]"
            try:
                levels = json.loads(raw_levels)
            except json.JSONDecodeError:
                continue

            changed = False
            for level in levels:
                if isinstance(level, dict) and level.get("steps"):
                    levels_cleared += 1
                    level["steps"] = []
                    changed = True

            if changed:
                cursor.execute(
                    "UPDATE course_details SET levels_json = ? WHERE course_id = ?",
                    (json.dumps(levels, ensure_ascii=False), row["course_id"]),
                )

        conn.commit()
        conn.close()
        return {"levelsCleared": levels_cleared, "cacheEntriesCleared": cache_entries_cleared}


db = DB()

