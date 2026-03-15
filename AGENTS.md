# OpenLearner - Agent Coding Guidelines

# 每次回答结束，都调用question工具来获取用户下一步输入

# 每次完成代码改动后，都运行start.py测试

This document provides context for agents working on the OpenLearner codebase. OpenLearner is an AI-powered personalized learning platform that converts study materials into interactive, gamified learning experiences.

## Project Overview

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI (runs on port 8003 by default)
- **Database**: SQLite (via better-sqlite3)
- **AI**: Multi-provider support (Gemini, OpenAI, Spark, Anthropic, local models)
- **Key Features**: Course generation, level-based learning, interactive components, user feedback, progress tracking

---

## Build, Lint & Test Commands

### Frontend (Next.js)

```bash
# Install dependencies
npm install

# Development mode (frontend only)
npm run dev

# Development mode (backend + frontend)
npm run dev:all

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# No test framework configured yet - tests are a future consideration
```

### Backend (Python FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run backend (port 8003)
uvicorn api.main:app --reload --port 8003

# Run tests
pytest

# Run specific test file
pytest tests/test_tools.py

# Run specific test
pytest tests/test_tools.py::test_retrieve_knowledge_returns_json -v
```

---

## Code Style Guidelines

### TypeScript Conventions

- **Strict Mode**: Disabled in tsconfig.json (`strict: false`). Be careful with `any` types.
- **Path Aliases**: Use `@/*` for imports (e.g., `import { Course } from '@/types'`)
- **Component Files**: `.tsx` for React components, `.ts` for utilities
- **Type Definitions**: Store in `src/types/index.ts`

### React Component Patterns

```typescript
// Client components must declare 'use client'
'use client';

import { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';
import { SomeType } from '@/types';

interface ComponentProps {
  prop: string;
  onAction: () => void;
}

export default function ComponentName({ prop, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // effect logic
  }, [prop]);

  return (
    <div className="component-styles">
      {/* JSX */}
    </div>
  );
}
```

### Import Order

1. React/Next imports (`'use client'`, `useState`, etc.)
2. External libraries (lucide-react, framer-motion)
3. Internal types (`@/types`)
4. Internal lib utilities (`@/lib/api`)
5. Internal components (`@/components/...`)

### Naming Conventions

- **Components**: PascalCase (e.g., `CourseView.tsx`, `LevelNode.tsx`)
- **Files**: kebab-case for non-component files (e.g., `api.ts`, `db.ts`)
- **Interfaces/Types**: PascalCase (e.g., `Course`, `UserProgress`, `LessonStep`)
- **Functions**: camelCase (e.g., `fetchCourses()`, `generateLevel()`)

### Tailwind CSS

- Use utility classes from Tailwind CSS
- Custom colors defined in `tailwind.config.ts` (e.g., `duo.green`, `duo.blue`)
- Custom shadows: `shadow-duo-btn`, `shadow-duo-btn-blue`
- Border radius: `rounded-2xl`, `rounded-3xl`, etc.
- Use `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground` for theming

### Error Handling

```typescript
// API calls
export async function fetchData() {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
}

// Async handlers
try {
  const result = await asyncOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### Database

- Uses SQLite via `better-sqlite3`
- Database file: `src/data/openlearner.db`
- Tables: `courses`, `levels`, `user_progress`, `user_answers`, `user_feedback`, `level_content_cache`

---

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── courses/       # Course CRUD
│   │   │   ├── progress/      # Progress tracking
│   │   │   ├── study/         # Study sessions
│   │   │   └── user/          # User data
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── assistant/         # AI assistant widgets
│   │   ├── course/            # Course creation/detail/list
│   │   ├── feedback/          # Result feedback modals
│   │   ├── home/              # Home dashboard views
│   │   ├── layout/            # Navbar/loading layout pieces
│   │   ├── learning/          # Level learning flow + renderer
│   │   ├── interactions/      # Learning interactions
│   │   │   ├── Segmenter.tsx  # Text segmentation
│   │   │   ├── Connector.tsx  # Node连线
│   │   │   └── Categorizer.tsx # 分类拖拽
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Shared UI atoms
│   ├── lib/                   # Utilities
│   │   ├── api.ts             # API functions
│   │   ├── db/                # Database utilities
│   │   └── animations/        # SVG animations
│   ├── data/                  # Frontend data and local db files
│   └── types/                 # TypeScript types
│       └── index.ts           # All type definitions
└── backend/               # Python FastAPI
    ├── api/main.py        # FastAPI app
    ├── modules/           # Backend modules
    │   ├── services/      # AI services
    │   ├── agent/         # Agent tools
    │   ├── knowledge/     # RAG knowledge base
    │   └── database/      # DB access layer
    └── tests/             # Python tests
```

---

## Key Patterns

### API Communication

- Frontend uses `src/lib/api.ts` for backend communication
- Backend URL: `http://localhost:8003` (configurable via `NEXT_PUBLIC_API_URL`)
- Other endpoints use Next.js API routes at `/api/*`

### Content Rendering

- `src/components/learning/ContentRenderer.tsx` handles LaTeX, HTML tables, and SVG animations
- LaTeX syntax: `$inline$` and `$$block$$`
- Animations: `[animation:neuron-network]`, `[animation:wave-animation]`, etc.

### State Management

- React Context for global state (`ProgressProvider`)
- Local useState for component-level state

### Environment Variables

Create `.env.local` for frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8003
```

Backend uses `.env` or environment variables for AI providers (GEMINI_API_KEY, SPARK_API_KEY, OPENAI_API_KEY, etc.)

---

## Common Tasks

### Adding a New API Endpoint (Frontend)

1. Create route file: `src/app/api/feature/route.ts`
2. Implement GET/POST handlers
3. Add API function in `src/lib/api.ts`

### Adding a New Component

1. Create file in `src/components/`
2. Use `'use client'` directive if using hooks
3. Import types from `@/types`
4. Use Tailwind for styling

## Important Notes

- This is a hybrid Next.js + FastAPI project - both need to run for full functionality
- The backend AI services are in Python; the frontend is TypeScript/React
- LaTeX rendering uses KaTeX
- Interactive components (Segmenter, Connector, Categorizer) are in `src/components/interactions/`
- No formal test framework for frontend yet; Python tests use pytest
