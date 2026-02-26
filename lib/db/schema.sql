-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 100,
  max_energy INTEGER DEFAULT 100,
  last_study_date TEXT
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  thumbnail TEXT,
  cover_image TEXT,
  lessons INTEGER DEFAULT 0,
  exercises INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  last_accessed_at TEXT
);

-- Course materials table (stores original upload)
CREATE TABLE IF NOT EXISTS course_materials (
  course_id TEXT PRIMARY KEY,
  material TEXT NOT NULL,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  steps TEXT, -- JSON string
  xp_reward INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Level content cache table
CREATE TABLE IF NOT EXISTS level_content_cache (
  level_id TEXT PRIMARY KEY,
  steps TEXT NOT NULL, -- JSON string
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

-- Study records table
CREATE TABLE IF NOT EXISTS study_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT,
  study_date TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapters_course ON chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_levels_course ON levels(course_id);
CREATE INDEX IF NOT EXISTS idx_levels_chapter ON levels(chapter_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_study_user ON study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_study_date ON study_records(study_date);

-- User answers table (stores answers for each question)
CREATE TABLE IF NOT EXISTS user_answers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL
);

-- User feedback table (stores difficulty feedback after questions and levels)
CREATE TABLE IF NOT EXISTS user_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  level_id TEXT,
  feedback_type TEXT NOT NULL,
  difficulty TEXT,
  feedback_text TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
