# OpenLearner - AI 驱动的个性化学习平台

## 功能特性

### 1. 后端功能

#### 学习进度跟踪
- **用户数据管理**: 存储用户的 XP、能量、连续学习天数
- **课程进度**: 记录每个课程的完成进度和关卡状态
- **学习记录**: 记录每次学习会话的时长和获得的 XP

#### 每日学习统计
- 自动检测今日是否学习
- 更新连续学习天数（如果昨天学习，今天继续则+1）
- 学习能量系统（完成关卡获得能量）

#### API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user` | GET | 获取用户数据和学习统计 |
| `/api/user?action=hint` | POST | 获取 AI 提示 |
| `/api/user?action=explain` | POST | 获取 AI 解释 |
| `/api/courses` | GET | 获取所有课程或课程详情 |
| `/api/study` | POST | 记录学习会话 |
| `/api/study?type=today` | GET | 检查今日学习状态 |
| `/api/progress` | POST | 更新关卡进度 |
| `/api/progress` | GET | 获取用户进度 |
| `/api/ai/generate-course` | POST | AI 生成新课程 |

### 2. AI 自动课程生成

#### 材料处理
- 支持粘贴文本材料（最少 50 字符）
- 智能分块：超长材料自动分块处理，避免超出上下文限制
- 分章节组织：AI 自动分析内容结构，划分为 3-6 个逻辑章节

#### 关卡设计
每个关卡包含：
1. **引入例子**: 真实场景、情境描述、详细解释
2. **知识讲解**: 核心概念、数学公式（LaTeX）
3. **交互练习**: 选择题、填空题、简答题（根据内容灵活选择）
4. **XP 奖励**: 根据难度设置（初级 50-100，中级 100-150，高级 150-200）

#### 渐进式学习
- 关卡按章节组织
- 蛇形路径布局（交替左右排列）
- 必须先完成前置关卡才能解锁后续

### 3. 页面结构

#### 首页 (`/`)
- 左侧：用户能量和连续学习天数
- 右侧：大图显示选中课程 + 进度条
- 下方：课程缩略图行（点击切换）
- 近期学习课程列表
- 右上角"+"按钮创建新课程

#### 课程列表 (`/courses`)
- 网格展示所有课程
- 显示：缩略图、标题、简介、进度条
- 点击跳转课程详情

#### 课程详情 (`/course-detail`)
- 左侧：章节列表
- 右侧：蛇形关卡路径（按章节分组）
- 显示关卡状态（锁定/可用/已完成）

#### 关卡学习 (`/learning`)
渐进式三阶段：
1. **例子引入**: 场景说明、实际问题
2. **知识讲解**: 概念解释、公式、AI 视觉辅助
3. **练习测试**: 多种题型、即时反馈

## 配置说明

### 环境变量

创建 `.env.local` 文件：

#### 1. OpenAI (默认)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
```

#### 2. Azure OpenAI
```env
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

#### 3. Anthropic Claude
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### 4. 讯飞星火 (Xunfei Spark)
```env
AI_PROVIDER=spark
SPARK_API_KEY=your_api_key
SPARK_MODEL=generalv3.5
```

#### 5. 通用 OpenAI-Compatible (Ollama, LM Studio, 等)
```env
AI_PROVIDER=generic
OPENAI_API_KEY=your_key_or_empty
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama2
```

### AI Provider 配置说明

| Provider | 必需环境变量 | 可选环境变量 |
|----------|-------------|-------------|
| OpenAI | `OPENAI_API_KEY` | `OPENAI_MODEL`, `OPENAI_BASE_URL` |
| Azure OpenAI | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME` | - |
| Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL`, `ANTHROPIC_BASE_URL` |
| Spark | `SPARK_API_KEY` | `SPARK_MODEL`, `SPARK_BASE_URL` |
| Generic | `OPENAI_API_KEY`, `OPENAI_BASE_URL` | `OPENAI_MODEL` |

### 使用本地模型

你可以使用 Ollama、LM Studio 或其他 OpenAI-compatible 的本地模型：

**Ollama 示例：**
```bash
# 安装 Ollama
# 启动 Ollama 并拉取模型
ollama pull llama2

# .env.local
AI_PROVIDER=generic
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama2
OPENAI_API_KEY=ollama  # 可以是任意值
```

**LM Studio 示例：**
```bash
# 在 LM Studio 中加载模型并启动本地服务器

# .env.local
AI_PROVIDER=generic
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_MODEL=local-model
OPENAI_API_KEY=lm-studio  # 可以是任意值
```

### 数据库

当前使用内存存储（适合演示）：
- 数据在服务器重启后丢失
- 生产环境建议迁移到 SQLite/PostgreSQL

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 使用指南

### 创建新课程

1. 点击首页右上角"+ 添加材料"
2. 输入课程标题（可选）
3. 选择难度级别
4. 粘贴学习材料（教科书章节、技术文档、笔记等）
5. 点击"生成课程"
6. 等待 AI 生成（30-60 秒）
7. 预览并确认创建

### 学习流程

1. 选择课程进入详情页
2. 点击可用关卡开始学习
3. 按顺序完成：例子 → 讲解 → 练习
4. 通过测试获得 XP，解锁下一关

### 学习统计

- 每日首次学习自动记录
- 连续学习保持 streak
- 完成关卡获得能量和 XP

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **后端**: Next.js API Routes
- **AI**: 支持多种 Provider (OpenAI, Azure, Anthropic, Spark, 本地模型)
- **数据库**: 内存存储（可迁移到 SQLite/PostgreSQL）
- **公式渲染**: KaTeX

## 注意事项

1. **API Key**: 必须配置有效的 AI Provider 才能使用 AI 功能
2. **模型选择**: 课程生成推荐使用 GPT-4、Claude 3 或 Spark Max，提示功能可用轻量级模型
3. **内容长度**: 材料越长，生成时间越长（超长内容自动分块）
4. **浏览器存储**: 刷新页面后学习进度保留（存储在服务端内存）
5. **并发**: 内存数据库不适合高并发场景

## 未来改进

- [ ] 持久化数据库（SQLite/PostgreSQL）
- [ ] 用户认证系统
- [ ] 更多题型支持（拖拽排序、代码执行等）
- [ ] 学习数据分析仪表板
- [ ] 社交功能（学习小组、排行榜）
