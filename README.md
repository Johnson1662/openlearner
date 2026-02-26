# OpenLearner - AI 驱动的个性化学习平台

将任何学习材料转化为交互式、游戏化的学习体验。

## 功能特性

### 1. 智能课程生成

- **材料输入**: 支持粘贴文本、上传 PDF/Word 文档
- **AI 自动生成**: 根据材料内容智能生成课程章节和关卡
- **按需生成**: 用户完成当前关卡后才生成下一关，永久缓存

### 2. 交互式学习体验

- **多元素内容**: 支持文字、LaTeX 数学公式、HTML 表格、SVG 动画
- **预设动画库**: 11 种精美预设动画（神经网络、波动、脉冲等）
- **即时反馈**: 答题后立即显示正确/错误及解析

### 3. 用户反馈系统

- **双层反馈**: 答题后 + 关卡完成后都需要反馈
- **难度选择**: 太难 / 刚刚好 / 太简单
- **文本反馈**: 可输入详细建议
- **动态调整**: AI 根据反馈自动调整下一关难度

### 4. 进度跟踪

- **SQLite 本地存储**: 数据永久保存
- **关卡状态**: 显示锁定/可用/已完成
- **完成标记**: 学过的关卡显示绿色打勾

### 5. 交互组件

- **Segmenter**: 文本分割练习
- **Connector**: 节点连线
- **Categorizer**: 分类拖拽（已修复拖拽问题）

## 页面结构

| 页面 | 描述 |
|------|------|
| 首页 | 课程列表、用户统计、创建新课程 |
| 课程详情 | 关卡列表、进度显示 |
| 关卡学习 | 逐步学习、答题、反馈 |

## 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# 讯飞星火 (推荐)
AI_PROVIDER=spark
SPARK_API_KEY=your_api_key
SPARK_MODEL=generalv3.5

# 或 OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key

# 或本地模型 (Ollama)
AI_PROVIDER=generic
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama2
OPENAI_API_KEY=ollama
```

### AI Provider 支持

| Provider | 环境变量 |
|----------|----------|
| 讯飞星火 | `SPARK_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Azure OpenAI | `AZURE_OPENAI_*` |
| Anthropic | `ANTHROPIC_API_KEY` |
| 本地模型 | `generic` + `OPENAI_BASE_URL` |

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

## 使用流程

### 1. 创建课程
1. 点击"+"按钮
2. 输入课程标题
3. 粘贴学习材料
4. 等待 AI 生成

### 2. 学习关卡
1. 选择课程进入详情
2. 点击关卡开始学习
3. 阅读内容 → 答题
4. 答题后弹出反馈选择
5. 关卡完成后再次反馈

### 3. 反馈循环
- 每题回答后选择难度
- 每关完成后选择难度
- AI 根据反馈调整下一关

## 内容格式

### LaTeX 公式

```markdown
行内公式: $E = mc^2$

行间公式:
$$
\int_{a}^{b} f(x) dx
$$
```

### 预设动画

```markdown
[animation:neuron-network]  - 神经网络
[animation:wave-animation]   - 波动动画
[animation:circle-pulse]   - 脉冲效果
[animation:data-flow]      - 数据流动
```

### HTML 表格

```html
<table>
<tr><th>层</th><th>神经元数</th></tr>
<tr><td>输入层</td><td>784</td></tr>
</table>
```

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **后端**: Next.js API Routes
- **AI**: 多 Provider 支持 (OpenAI, Azure, Anthropic, Spark, 本地模型)
- **数据库**: SQLite (本地持久化)
- **公式渲染**: KaTeX

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── ai/          # AI 生成 API
│   │   ├── courses/     # 课程 API
│   │   ├── progress/    # 进度 API
│   │   └── user/       # 用户 API
│   ├── page.tsx        # 主页面
│   └── layout.tsx      # 布局
├── components/
│   ├── interactions/    # 交互组件
│   ├── providers/      # Context Providers
│   ├── LevelView.tsx   # 关卡学习页面
│   ├── ContentRenderer.tsx  # 内容渲染器
│   └── UserFeedbackModal.tsx  # 反馈弹窗
├── lib/
│   ├── ai/             # AI 生成逻辑
│   ├── animations/     # SVG 预设动画
│   └── db/             # 数据库 (SQLite)
└── data/               # SQLite 数据库文件
```

## 数据库

数据存储在 `data/openlearner.db`：

- `courses` - 课程
- `levels` - 关卡
- `user_progress` - 用户进度
- `user_answers` - 用户答题记录
- `user_feedback` - 用户反馈
- `level_content_cache` - 关卡内容缓存

## 最近更新

- ✅ 添加用户反馈系统（难度选择 + 文本）
- ✅ 添加动态难度调整
- ✅ 修复 Categorizer 拖拽问题
- ✅ 修复 Connector SVG 坐标问题
- ✅ 修复 ProgressProvider 副作用问题
- ✅ 添加 LaTeX 公式渲染
- ✅ 添加预设 SVG 动画库
- ✅ SQLite 持久化存储
- ✅ 进度保存和显示已完成关卡

## License

MIT
