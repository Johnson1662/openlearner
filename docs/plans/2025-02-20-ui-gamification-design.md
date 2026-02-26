# OpenLearner UI 游戏化改版设计文档

**日期**: 2025-02-20  
**设计师**: Claude (AI Assistant)  
**版本**: 1.0  
**状态**: 已批准，待实施

---

## 1. 设计目标

### 愿景
让学习像玩游戏一样上瘾，同时保持专业教育平台的品质感。

### 核心 KPI
- 用户每日活跃度提升 30%
- 关卡完成率提升 25%
- 平均学习时长增加 15 分钟

---

## 2. 视觉系统升级

### 2.1 色彩系统

```css
:root {
  /* 主品牌色 */
  --brand-primary: #6366F1;      /* 保留靛蓝 */
  --brand-secondary: #818CF8;    /* 辅助紫 */
  
  /* 游戏化辅助色 */
  --game-success: #22C55E;       /* 成功绿 */
  --game-warning: #F59E0B;       /* 警告橙 */
  --game-error: #EF4444;         /* 错误红 */
  --game-gold: #FBBF24;          /* 金币黄 */
  --game-xp: #10B981;            /* XP 绿 */
  
  /* 动态主题色（根据课程切换）*/
  --theme-math: #3B82F6;         /* 数学-蓝 */
  --theme-history: #A78BFA;      /* 历史-紫 */
  --theme-programming: #10B981;  /* 编程-绿 */
  --theme-science: #F97316;      /* 科学-橙 */
}
```

### 2.2 字体层级

| 用途 | 字体 | 大小 | 字重 |
|------|------|------|------|
| 主标题 | Plus Jakarta Sans | 32px | Bold |
| 副标题 | Plus Jakarta Sans | 24px | Semibold |
| 正文 | Plus Jakarta Sans | 16px | Regular |
| 辅助文本 | Plus Jakarta Sans | 14px | Medium |
| 数字/XP | Inter | 可变 | Bold (等宽) |

### 2.3 组件样式

#### 按钮升级

**主按钮 (Primary)**
- 渐变背景: `linear-gradient(135deg, #6366F1 0%, #818CF8 100%)`
- 3D 按压效果: `box-shadow: 0 4px 0 #4F46E5`
- 点击动画: translateY(2px) + 阴影缩小
- Hover: 亮度增加 + 阴影扩散

**次按钮 (Secondary)**
- 玻璃态背景: `rgba(255, 255, 255, 0.7)`
- 边框: `1px solid rgba(99, 102, 241, 0.2)`
- Hover: 悬浮上浮 4px + 背景变亮

**禁用态 (Disabled)**
- 背景: `#E5E5E5`
- 文字: `#AFAFAF`
- 光标: `not-allowed`
- 无交互效果

#### 卡片升级

**玻璃态卡片 (Glass Card)**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(99, 102, 241, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

**课程卡片 (Course Card)**
- 悬停: scale(1.02) + 阴影增强
- 过渡: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- 图片: `object-cover` + 悬停放大

**关卡节点 (Level Node)**
- 形状: 圆形 (w-20 h-20)
- 已完成: 绿色渐变 + 对勾图标
- 进行中: 蓝色渐变 + 脉冲动画
- 锁定: 灰色 + 锁图标
- 悬停: scale(1.15) + 阴影扩散

---

## 3. 游戏化系统

### 3.1 连胜系统 (Streak)

**位置**: 导航栏右上角

**设计细节**:
- 火焰图标 (Lucide: `Flame`) + 数字（连续天数）
- 火焰大小随天数变化:
  - 1-3 天: 小火苗 🔥
  - 4-7 天: 中火 🔥🔥
  - 8-30 天: 大火 🔥🔥🔥
  - 30+ 天: 超级火焰 🔥🔥🔥🔥
- 持续微动画: 轻微摇摆 (1s ease-in-out infinite)
- 中断动画: 火焰熄灭 + 烟雾上升效果
- 每日提醒: 首次学习时 Toast 提示"保持 X 天连胜！"

**数据结构**:
```typescript
interface StreakData {
  current: number;        // 当前连胜天数
  longest: number;        // 最长连胜记录
  lastStudyDate: string;  // 最后学习日期 (ISO 8601)
  isTodayStudied: boolean; // 今日是否已学习
}
```

### 3.2 XP 与等级系统

**XP 获取规则**:

| 行为 | XP 奖励 |
|------|---------|
| 完成关卡（基础） | 50-200 XP（根据难度） |
| 完美答题（首次正确） | +20 XP |
| 连续正确答题（连击） | +5/10/15/20... XP |
| 每日首关 | 2x 倍率 |
| 完成章节 | +100 XP |
| 解锁成就 | 不定 |

**等级系统**:

```typescript
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "新手" },
  { level: 2, xp: 100, title: "学徒" },
  { level: 3, xp: 300, title: "学者" },
  { level: 4, xp: 600, title: "进阶者" },
  { level: 5, xp: 1000, title: "专家" },
  // ... 以此类推
];
```

**视觉设计**:
- 等级条: 圆形进度环，显示在头像下方
- 升级动画: 全屏彩纸 + 等级徽章放大 + 新称号展示
- XP 增长: 数字滚动动画（从旧值到新值）

### 3.3 关卡星标评价

**评分标准**:

| 星级 | 条件 |
|------|------|
| ⭐⭐⭐ 完美 | 首次尝试正确 + 快速完成（< 平均时间 50%） |
| ⭐⭐ 良好 | 首次尝试正确 |
| ⭐ 通过 | 多次尝试后正确 |
| ❌ 未通关 | 未完成关卡 |

**视觉表现**:
- 关卡节点上叠加 1-3 颗金色星星
- 完成时弹出星级评定动画（星星逐个亮起）
- 课程封面显示平均星级

### 3.4 成就徽章系统

**徽章类型**:

| 徽章 | 图标 | 解锁条件 |
|------|------|----------|
| 🏆 初出茅庐 | Trophy | 完成 10 个关卡 |
| 🏆 学习达人 | Trophy | 完成 50 个关卡 |
| 🏆 知识大师 | Trophy | 完成 100 个关卡 |
| 🔥 连胜大师 | Flame | 连续学习 7 天 |
| 🔥 超级连胜 | Flame | 连续学习 30 天 |
| ⚡ 速度之星 | Zap | 快速完成 10 个关卡 |
| 🎯 完美主义 | Target | 连续 10 次完美答题 |
| 📚 课程收藏家 | BookOpen | 完成 5 门课程 |
| 🎨 全能学者 | Palette | 完成 3 个不同领域的课程 |

**徽章展示**:
- 个人资料页徽章墙（网格布局）
- 解锁时底部 Toast 通知（带徽章图标）
- 悬停显示徽章详情和解锁日期

### 3.5 进度可视化

**学习热力图**:
- 类似 GitHub contributions graph
- 显示最近 365 天的学习活跃度
- 颜色深浅表示学习时长（浅→深：短→长）
- 悬停显示具体日期和学习时长

**课程进度环**:
- 课程封面中心显示圆形进度条
- 使用 SVG `stroke-dasharray` 实现
- 100% 完成时显示金色边框和完成徽章

---

## 4. 学习体验优化

### 4.1 关卡选择页面 (CourseDetailView)

**蛇形路径升级**:

```
    [关卡1]────[关卡2]
                │
    [关卡4]────[关卡3]
    │
    [关卡5]────[关卡6]
```

**关卡节点状态**:

| 状态 | 视觉表现 | 动画 |
|------|----------|------|
| 已完成 | 绿色圆形 + 对勾 + 星星 | 悬停时轻微弹跳 |
| 进行中 | 蓝色圆形 + 闪电图标 + 脉冲 | 持续脉冲光环 |
| 下一个可用 | 蓝色圆形 + 播放图标 | 悬停时放大 + 发光 |
| 锁定 | 灰色圆形 + 锁图标 | 点击时震动提示 |
| Boss 关卡 | 大号金色圆形 + 皇冠 | 悬停时旋转发光 |

**章节分隔**:
- 章节标题卡片（玻璃态）
- 显示章节进度（X/Y 关卡完成）
- 完成章节显示"章节完成"徽章

### 4.2 学习界面 (LevelView)

**进度条**:
- 顶部固定，圆角设计
- 每完成一步填充绿色
- 显示当前步骤: "第 2 步 / 共 5 步"

**答题反馈升级**:

**正确答案**:
1. 选项按钮变绿色 + 对勾图标
2. 播放成功音效（可选）
3. 显示 XP 获得浮动文字 "+15 XP"
4. 底部面板滑入（绿色背景）
5. "继续"按钮带弹跳动画

**错误答案**:
1. 选项按钮变红色 + 震动效果（0.4s）
2. 播放错误音效（可选）
3. 底部面板滑入（红色背景）
4. 显示提示按钮（灯泡图标）
5. "重试"按钮 3D 按压效果

**完成庆祝**:
- Canvas Confetti（2-3 秒彩纸飘落）
- XP 数字滚动增长（从 0 到实际值）
- 解锁下一关动画（关卡节点从灰色变蓝色）
- 可选：完美通关额外特效（金色光环 + 星星）

### 4.3 交互组件升级

**按钮微动效规范**:

```typescript
// Framer Motion 配置
const buttonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    y: 2,
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
    transition: { duration: 0.1 }
  }
};
```

**卡片悬浮效果**:

```typescript
const cardVariants = {
  initial: { y: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  hover: { 
    y: -4,
    boxShadow: "0 12px 32px rgba(99, 102, 241, 0.2)",
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};
```

**页面过渡**:

```typescript
// AnimatePresence 配置
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};
```

---

## 5. 动画规范

### 5.1 时间曲线

```typescript
export const transitions = {
  // 快速（按钮、hover）
  quick: { 
    duration: 0.2, 
    ease: [0.4, 0, 0.2, 1] 
  },
  
  // 标准（页面切换、面板展开）
  normal: { 
    duration: 0.4, 
    ease: [0.4, 0, 0.2, 1] 
  },
  
  // 慢速（庆祝动画）
  slow: { 
    duration: 0.6, 
    ease: [0.4, 0, 0.2, 1] 
  },
  
  // 弹性（成功反馈、弹跳）
  spring: { 
    type: 'spring', 
    stiffness: 400, 
    damping: 25 
  },
  
  // 强弹跳（XP 增长、徽章解锁）
  bounce: { 
    type: 'spring', 
    stiffness: 300, 
    damping: 10 
  }
};
```

### 5.2 关键动画参数

**Confetti 庆祝**:
- 库: `canvas-confetti`
- 持续时间: 2-3 秒
- 粒子数: 50-100
- 颜色: 品牌色 + 金色 + 白色
- 触发时机: 关卡完成、升级、解锁成就

**XP 数字滚动**:
- 持续时间: 1 秒
- 缓动: `ease-out`
- 格式: `+{value} XP`
- 动画: 从 0 滚动到目标值

**连胜火焰**:
- 摇摆: `rotate: [-5, 5]`
- 周期: 2 秒
- 悬停: scale(1.2) + 亮度增加

**按钮按压**:
- 按下: translateY(2px) + shadow 缩小
- 释放: 回弹（spring 物理效果）
- 反馈: 触感反馈（移动端）

---

## 6. 响应式适配

### 6.1 桌面端 (>1024px)

**导航栏**:
- Logo + 导航链接（首页、课程、成就）
- 右侧: 连胜火焰 + XP + 头像

**首页**:
- 左右分栏: 左侧统计 + 右侧课程卡片
- 底部: 近期学习课程（横向滚动）

**课程详情**:
- 左侧: 课程信息卡片（固定）
- 右侧: 蛇形关卡路径（可滚动）

**学习界面**:
- 内容居中（max-width: 640px）
- 底部固定操作栏

### 6.2 平板端 (768px-1024px)

**导航栏**:
- 简化: Logo + 汉堡菜单
- 隐藏部分导航链接

**首页**:
- 单列布局，卡片堆叠
- 课程卡片全宽

**课程详情**:
- 全宽蛇形路径
- 课程信息折叠或顶部显示

**学习界面**:
- 保持居中
- 按钮增大（触控优化）

### 6.3 移动端 (<768px)

**导航栏**:
- 仅 Logo + 连胜火焰 + 菜单按钮

**首页**:
- 垂直滚动
- 卡片全宽 + 简化信息

**课程详情**:
- 垂直关卡列表（替代蛇形路径）
- 章节可折叠

**学习界面**:
- 底部固定按钮（安全区域适配）
- 触控区域最小 44px
- 字体适当增大

---

## 7. 技术实现要点

### 7.1 依赖库

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "canvas-confetti": "^1.x",
    "@radix-ui/react-tooltip": "^1.x",
    "lucide-react": "^0.x"
  }
}
```

### 7.2 状态管理

**游戏化状态 (Gamification State)**:

```typescript
// types/gamification.ts

interface GamificationState {
  // 连胜
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string;
    isTodayStudied: boolean;
  };
  
  // XP 和等级
  xp: {
    current: number;
    total: number;
    level: number;
    nextLevelXp: number;
  };
  
  // 徽章
  badges: Badge[];
  
  // 成就
  achievements: Achievement[];
  
  // 热力图数据
  heatmap: HeatmapData[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  total: number;
  completed: boolean;
}

interface HeatmapData {
  date: string;
  duration: number; // 分钟
  xpEarned: number;
}
```

### 7.3 性能优化

**动画性能**:
- 使用 `transform` 和 `opacity`（GPU 加速）
- 避免 `layout` 属性动画（width, height, margin）
- 使用 `will-change` 预声明动画元素
- 复杂动画使用 CSS 替代 JS

**移动端优化**:
- Confetti 粒子数减半（移动端 30-50）
- 减少同时运行的动画数量
- 使用 `prefers-reduced-motion` 媒体查询

**加载优化**:
- 图片懒加载 (next/image)
- 动画库按需加载
- 字体预加载

---

## 8. 实施阶段

### Phase 1: 视觉基础 (Week 1-2)

**目标**: 建立新的视觉系统基础

- [ ] 更新全局 CSS 变量（色彩系统）
- [ ] 重构 Button 组件（添加 3D 按压效果）
- [ ] 重构 Card 组件（玻璃态效果）
- [ ] 实现页面过渡动画（Framer Motion）
- [ ] 响应式布局调整（断点优化）

**交付物**:
- 更新的 globals.css
- 重构后的 Button、Card 组件
- 页面过渡动画 HOC

### Phase 2: 游戏化核心 (Week 3-4)

**目标**: 实现核心游戏化功能

- [ ] 连胜系统（状态管理 + UI + 动画）
- [ ] XP 进度条和等级系统
- [ ] 关卡星标评价系统
- [ ] 答题反馈动画优化（成功/失败）
- [ ] Confetti 庆祝效果集成

**交付物**:
- Streak 组件
- XPProgress 组件
- LevelStars 组件
- FeedbackPanel 升级
- Confetti 工具函数

### Phase 3: 高级功能 (Week 5-6)

**目标**: 完成高级游戏化功能

- [ ] 成就徽章系统（定义 + 解锁逻辑）
- [ ] 学习热力图组件
- [ ] 完成庆祝特效（关卡 + 章节 + 课程）
- [ ] Toast 通知系统（徽章解锁）
- [ ] 音效系统（可选，使用 Web Audio API）

**交付物**:
- BadgeSystem 组件
- HeatmapCalendar 组件
- CelebrationOverlay 组件
- ToastNotification 系统

### Phase 4: 测试与优化 (Week 7-8)

**目标**: 确保质量和性能

- [ ] 性能测试（60fps 动画验证）
- [ ] 跨浏览器测试（Chrome, Safari, Firefox）
- [ ] 移动端测试（iOS, Android）
- [ ] 用户测试（收集反馈）
- [ ] 动画时序微调
- [ ] Bug 修复和 polish

**交付物**:
- 性能测试报告
- Bug 修复列表
- 用户反馈总结

---

## 9. 成功指标

### 定量指标

- [ ] 页面加载时间增加 < 200ms（相比当前）
- [ ] 动画帧率保持 60fps（Chrome DevTools 验证）
- [ ] 移动端触控响应 < 100ms
- [ ] Lighthouse 性能评分 > 90

### 定性指标

- [ ] 用户反馈满意度 > 4.5/5
- [ ] 日活跃用户（DAU）提升 > 30%
- [ ] 关卡完成率提升 > 25%
- [ ] 平均学习时长增加 > 15 分钟

---

## 10. 附录

### 10.1 设计资源

**图标库**: Lucide React  
**动画库**: Framer Motion  
**特效库**: Canvas Confetti  
**字体**: Plus Jakarta Sans (Google Fonts)

### 10.2 参考链接

- [Framer Motion 文档](https://www.framer.com/motion/)
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- [Duolingo 设计系统](https://design.duolingo.com/)
- [Material Design 动效](https://m3.material.io/styles/motion/overview)

### 10.3 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2025-02-20 | 初始版本 | Claude |

---

**设计文档完成，等待实施计划生成。**
