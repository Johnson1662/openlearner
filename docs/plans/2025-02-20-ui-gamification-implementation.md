# OpenLearner UI 游戏化改版实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 OpenLearner 升级为具有 Duolingo 风格游戏化体验的现代化学习平台

**Architecture:** 
- 基于现有 Next.js + Tailwind + Framer Motion 技术栈
- 渐进式增强现有组件，避免大规模重构
- 分 4 个阶段实施，每个阶段可独立部署

**Tech Stack:** 
- Next.js 14 + React + TypeScript
- Tailwind CSS + Framer Motion
- Canvas Confetti (特效)
- Lucide React (图标)

**参考设计文档:** `docs/plans/2025-02-20-ui-gamification-design.md`

---

## 依赖安装

### Task 0.1: 安装新依赖

**Command:**
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

**Verify:**
```bash
npm list canvas-confetti
```

---

## Phase 1: 视觉基础 (Week 1)

### Task 1.1: 更新 CSS 变量和色彩系统

**Files:**
- Modify: `app/globals.css`

**Step 1: 添加新的 CSS 变量**

在 `:root` 中添加游戏化色彩变量：

```css
:root {
  /* 保留现有变量 */
  --brand-primary: #6366F1;
  --brand-secondary: #818CF8;
  --brand-cta: #10B981;
  --brand-cta-hover: #059669;
  --brand-accent: #F59E0B;
  
  /* 添加游戏化辅助色 */
  --game-success: #22C55E;
  --game-success-light: #DCFCE7;
  --game-success-dark: #15803D;
  --game-warning: #F59E0B;
  --game-warning-light: #FEF3C7;
  --game-error: #EF4444;
  --game-error-light: #FEE2E2;
  --game-error-dark: #B91C1C;
  --game-gold: #FBBF24;
  --game-xp: #10B981;
  
  /* 主题色（课程切换）*/
  --theme-math: #3B82F6;
  --theme-history: #A78BFA;
  --theme-programming: #10B981;
  --theme-science: #F97316;
}
```

**Step 2: 添加新的工具类**

在 `@layer components` 中添加：

```css
@layer components {
  /* 保留现有组件类 */
  
  /* 游戏化按钮 */
  .btn-game-primary {
    @apply px-8 py-4 rounded-2xl font-bold text-white transition-all duration-75;
    background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
    box-shadow: 0 4px 0 #4F46E5, 0 4px 16px rgba(99, 102, 241, 0.4);
  }
  
  .btn-game-primary:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 #4F46E5, 0 0 8px rgba(99, 102, 241, 0.2);
  }
  
  .btn-game-success {
    @apply px-8 py-4 rounded-2xl font-bold text-white transition-all duration-75;
    background: linear-gradient(135deg, #22C55E 0%, #10B981 100%);
    box-shadow: 0 4px 0 #15803D, 0 4px 16px rgba(34, 197, 94, 0.4);
  }
  
  .btn-game-success:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 #15803D;
  }
  
  .btn-game-error {
    @apply px-8 py-4 rounded-2xl font-bold text-white transition-all duration-75;
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    box-shadow: 0 4px 0 #B91C1C, 0 4px 16px rgba(239, 68, 68, 0.4);
  }
  
  .btn-game-error:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 #B91C1C;
  }
  
  /* XP 标签 */
  .badge-xp {
    @apply inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold;
    background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }
  
  /* 连胜火焰 */
  .streak-flame {
    @apply relative inline-flex items-center gap-1 font-bold;
    color: #F97316;
  }
  
  .streak-flame svg {
    filter: drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3));
  }
}
```

**Step 3: 测试按钮效果**

创建一个临时测试页面 `app/test/page.tsx`：

```tsx
export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Button Tests</h1>
      <button className="btn-game-primary">Primary Button</button>
      <button className="btn-game-success">Success Button</button>
      <button className="btn-game-error">Error Button</button>
      <span className="badge-xp">+15 XP</span>
      <div className="streak-flame">
        <span>🔥</span>
        <span>7</span>
      </div>
    </div>
  );
}
```

**Step 4: 验证**

访问 `http://localhost:3000/test`

Expected:
- Primary 按钮有紫色渐变和阴影
- Success 按钮有绿色渐变
- Error 按钮有红色渐变
- 点击时有按压效果
- XP 徽章是金黄色

**Step 5: 清理测试文件**

```bash
rm app/test/page.tsx
```

**Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat: add gamification color system and button styles"
```

---

### Task 1.2: 创建动画配置常量

**Files:**
- Create: `lib/animations.ts`

**Step 1: 创建动画配置文件**

```typescript
// lib/animations.ts

import { Variants, Transition } from 'framer-motion';

// 时间曲线
export const transitions = {
  quick: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  normal: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring' as const, stiffness: 400, damping: 25 },
  bounce: { type: 'spring' as const, stiffness: 300, damping: 10 },
};

// 按钮动画变体
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: transitions.quick
  },
  tap: { 
    scale: 0.95,
    y: 2,
    transition: { duration: 0.1 }
  }
};

// 卡片悬浮动画
export const cardVariants: Variants = {
  initial: { y: 0 },
  hover: { 
    y: -4,
    transition: transitions.normal
  }
};

// 页面过渡动画
export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// 淡入动画
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// 弹入动画
export const popIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: transitions.spring
  },
  exit: { scale: 0.8, opacity: 0 }
};

// 滑入动画（从底部）
export const slideUp: Variants = {
  initial: { y: 50, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: transitions.spring
  },
  exit: { y: 50, opacity: 0 }
};

// 震动动画（错误反馈）
export const shake: Variants = {
  animate: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 }
  }
};

// 脉冲动画（进行中状态）
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  }
};

// 摇摆动画（火焰）
export const wobble: Variants = {
  animate: {
    rotate: [-5, 5, -5],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};
```

**Step 2: Commit**

```bash
git add lib/animations.ts
git commit -m "feat: add animation constants and variants"
```

---

### Task 1.3: 重构 Button 组件

**Files:**
- Create: `components/ui/GameButton.tsx`

**Step 1: 创建游戏化按钮组件**

```tsx
// components/ui/GameButton.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { buttonVariants } from '@/lib/animations';

type ButtonVariant = 'primary' | 'success' | 'error' | 'secondary' | 'ghost';

interface GameButtonProps extends Omit<HTMLMotionProps<'button'>, 'variant'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-game-primary',
  success: 'btn-game-success',
  error: 'btn-game-error',
  secondary: 'btn-game-secondary',
  ghost: 'btn-game-ghost',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function GameButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: GameButtonProps) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={disabled || isLoading ? undefined : 'hover'}
      whileTap={disabled || isLoading ? undefined : 'tap'}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      ) : (
        children
      )}
    </motion.button>
  );
}
```

**Step 2: 添加辅助样式到 globals.css**

```css
.btn-game-secondary {
  @apply px-8 py-4 rounded-2xl font-semibold transition-all duration-200;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.btn-game-secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.btn-game-ghost {
  @apply px-8 py-4 rounded-2xl font-semibold text-gray-600 transition-all duration-200;
}

.btn-game-ghost:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--brand-primary);
}
```

**Step 3: Commit**

```bash
git add components/ui/GameButton.tsx app/globals.css
git commit -m "feat: create GameButton component with gamified interactions"
```

---

### Task 1.4: 重构卡片悬浮效果

**Files:**
- Create: `components/ui/GameCard.tsx`

**Step 1: 创建游戏化卡片组件**

```tsx
// components/ui/GameCard.tsx
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cardVariants } from '@/lib/animations';

interface GameCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hover?: boolean;
}

export default function GameCard({
  children,
  hover = true,
  className = '',
  ...props
}: GameCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover={hover ? 'hover' : undefined}
      className={`
        glass-card
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: 更新现有卡片组件（可选）**

在需要使用的地方替换：

```tsx
// Before
<div className="glass-card">...</div>

// After
<GameCard>...</GameCard>
```

**Step 3: Commit**

```bash
git add components/ui/GameCard.tsx
git commit -m "feat: create GameCard component with hover effects"
```

---

## Phase 2: 游戏化核心 (Week 2)

### Task 2.1: 创建游戏化状态 Hook

**Files:**
- Create: `hooks/useGamification.ts`
- Create: `types/gamification.ts`

**Step 1: 创建类型定义**

```typescript
// types/gamification.ts

export interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string;
  isTodayStudied: boolean;
}

export interface XPData {
  current: number;
  total: number;
  level: number;
  nextLevelXp: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GamificationState {
  streak: StreakData;
  xp: XPData;
  badges: Badge[];
}

// 等级阈值配置
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: '新手' },
  { level: 2, xp: 100, title: '学徒' },
  { level: 3, xp: 300, title: '学者' },
  { level: 4, xp: 600, title: '进阶者' },
  { level: 5, xp: 1000, title: '专家' },
  { level: 6, xp: 1500, title: '大师' },
  { level: 7, xp: 2200, title: '宗师' },
  { level: 8, xp: 3000, title: '传奇' },
];

// 计算等级
export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number } {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      const nextLevel = LEVEL_THRESHOLDS[i + 1];
      return {
        level: LEVEL_THRESHOLDS[i].level,
        title: LEVEL_THRESHOLDS[i].title,
        nextLevelXp: nextLevel ? nextLevel.xp : LEVEL_THRESHOLDS[i].xp
      };
    }
  }
  return { level: 1, title: '新手', nextLevelXp: 100 };
}
```

**Step 2: 创建 Hook**

```typescript
// hooks/useGamification.ts
'use client';

import { useState, useCallback } from 'react';
import { GamificationState, calculateLevel } from '@/types/gamification';

// 初始状态
const initialState: GamificationState = {
  streak: {
    current: 7,
    longest: 30,
    lastStudyDate: new Date().toISOString(),
    isTodayStudied: true,
  },
  xp: {
    current: 450,
    total: 450,
    level: 3,
    nextLevelXp: 600,
  },
  badges: [],
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>(initialState);

  // 添加 XP
  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newTotal = prev.xp.total + amount;
      const levelInfo = calculateLevel(newTotal);
      
      return {
        ...prev,
        xp: {
          current: prev.xp.current + amount,
          total: newTotal,
          level: levelInfo.level,
          nextLevelXp: levelInfo.nextLevelXp,
        }
      };
    });
  }, []);

  // 更新连胜
  const updateStreak = useCallback((studiedToday: boolean) => {
    setState(prev => ({
      ...prev,
      streak: {
        ...prev.streak,
        isTodayStudied: studiedToday,
        current: studiedToday ? prev.streak.current : 0,
      }
    }));
  }, []);

  // 记录学习
  const recordStudy = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = state.streak.lastStudyDate.split('T')[0];
    
    if (today !== lastStudy) {
      setState(prev => ({
        ...prev,
        streak: {
          ...prev.streak,
          current: prev.streak.current + 1,
          longest: Math.max(prev.streak.longest, prev.streak.current + 1),
          lastStudyDate: new Date().toISOString(),
          isTodayStudied: true,
        }
      }));
    }
  }, [state.streak.lastStudyDate]);

  return {
    ...state,
    addXP,
    updateStreak,
    recordStudy,
  };
}
```

**Step 3: Commit**

```bash
git add types/gamification.ts hooks/useGamification.ts
git commit -m "feat: add gamification state management hook"
```

---

### Task 2.2: 创建连胜火焰组件

**Files:**
- Create: `components/gamification/StreakFlame.tsx`

**Step 1: 创建组件**

```tsx
// components/gamification/StreakFlame.tsx
'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { wobble } from '@/lib/animations';

interface StreakFlameProps {
  days: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { icon: 16, text: 'text-sm' },
  md: { icon: 20, text: 'text-base' },
  lg: { icon: 24, text: 'text-lg' },
};

// 根据连胜天数确定火焰大小和颜色
function getFlameIntensity(days: number): { scale: number; color: string } {
  if (days >= 30) return { scale: 1.5, color: '#DC2626' }; // 超级火焰 - 红色
  if (days >= 7) return { scale: 1.3, color: '#F97316' };  // 大火 - 橙色
  if (days >= 3) return { scale: 1.1, color: '#FBBF24' };  // 中火 - 黄色
  return { scale: 1, color: '#F59E0B' };                 // 小火 - 琥珀
}

export default function StreakFlame({ days, showText = true, size = 'md' }: StreakFlameProps) {
  const { scale, color } = getFlameIntensity(days);
  const { icon, text } = sizeConfig[size];

  return (
    <motion.div
      className="flex items-center gap-1"
      variants={wobble}
      animate="animate"
      title={`${days} 天连胜`}
    >
      <motion.div
        animate={{ scale: [1, scale, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame 
          size={icon} 
          fill={color}
          color={color}
          style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
        />
      </motion.div>
      {showText && (
        <span className={`${text} font-bold`} style={{ color }}>
          {days}
        </span>
      )}
    </motion.div>
  );
}
```

**Step 2: Commit**

```bash
git add components/gamification/StreakFlame.tsx
git commit -m "feat: add StreakFlame component with wobble animation"
```

---

### Task 2.3: 创建 XP 进度环组件

**Files:**
- Create: `components/gamification/XPProgressRing.tsx`

**Step 1: 创建组件**

```tsx
// components/gamification/XPProgressRing.tsx
'use client';

import { motion } from 'framer-motion';

interface XPProgressRingProps {
  current: number;
  total: number;
  level: number;
  size?: number;
  strokeWidth?: number;
}

export default function XPProgressRing({
  current,
  total,
  level,
  size = 60,
  strokeWidth = 4,
}: XPProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / total, 1);
  const dashOffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 背景圆环 */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆环 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#xpGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 等级数字 */}
      <div className="flex flex-col items-center">
        <span className="text-lg font-black text-gray-800">{level}</span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/gamification/XPProgressRing.tsx
git commit -m "feat: add XPProgressRing component"
```

---

### Task 2.4: 更新导航栏 (Navbar)

**Files:**
- Modify: `components/Navbar.tsx`

**Step 1: 导入新组件**

```tsx
import StreakFlame from './gamification/StreakFlame';
import XPProgressRing from './gamification/XPProgressRing';
```

**Step 2: 更新 Navbar 组件**

在右侧统计区域添加游戏化元素：

```tsx
// 在右侧 div 中添加：
<div className="flex items-center space-x-4">
  {/* 连胜火焰 */}
  <StreakFlame days={progress?.currentStreak ?? 0} size="md" />
  
  {/* XP 进度环 */}
  <XPProgressRing 
    current={progress?.totalXP ?? 0}
    total={600}
    level={3}
    size={48}
  />
  
  {/* 菜单按钮 */}
  <div className="text-xl cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
    ☰
  </div>
</div>
```

**Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: integrate StreakFlame and XPProgressRing into Navbar"
```

---

### Task 2.5: 创建关卡星标组件

**Files:**
- Create: `components/gamification/LevelStars.tsx`

**Step 1: 创建组件**

```tsx
// components/gamification/LevelStars.tsx
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface LevelStarsProps {
  stars: 0 | 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const sizeConfig = {
  sm: 12,
  md: 16,
  lg: 20,
};

export default function LevelStars({ stars, size = 'md', animate = false }: LevelStarsProps) {
  const iconSize = sizeConfig[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((starIndex) => (
        <motion.div
          key={starIndex}
          initial={animate ? { scale: 0 } : false}
          animate={animate && starIndex <= stars ? { scale: 1 } : { scale: starIndex <= stars ? 1 : 0.3 }}
          transition={{ delay: starIndex * 0.1, type: 'spring', stiffness: 400 }}
        >
          <Star
            size={iconSize}
            fill={starIndex <= stars ? '#FBBF24' : 'transparent'}
            color={starIndex <= stars ? '#FBBF24' : '#D1D5DB'}
            className={starIndex <= stars ? 'drop-shadow-sm' : ''}
          />
        </motion.div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/gamification/LevelStars.tsx
git commit -m "feat: add LevelStars component for rating completed levels"
```

---

### Task 2.6: 升级 FeedbackPanel 动画

**Files:**
- Modify: `components/interactions/FeedbackPanel.tsx`

**Step 1: 升级动画效果**

添加更丰富的动画：

```tsx
// 在导入中添加
import { popIn, slideUp } from '@/lib/animations';

// 更新成功反馈部分
{show && (
  <motion.div
    variants={slideUp}
    initial="initial"
    animate="animate"
    exit="exit"
    // ... 其他属性
  >
    {/* 添加成功时的 XP 浮动效果 */}
    {type === 'success' && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="badge-xp"
      >
        +15 XP
      </motion.div>
    )}
  </motion.div>
)}
```

**Step 2: Commit**

```bash
git add components/interactions/FeedbackPanel.tsx
git commit -m "feat: enhance FeedbackPanel with gamification animations"
```

---

### Task 2.7: 集成 Confetti 庆祝效果

**Files:**
- Create: `lib/confetti.ts`
- Modify: `components/LevelView.tsx`

**Step 1: 创建 Confetti 工具**

```typescript
// lib/confetti.ts
import confetti from 'canvas-confetti';

export function triggerConfetti(options?: confetti.Options) {
  const defaults: confetti.Options = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366F1', '#22C55E', '#FBBF24', '#F59E0B'],
    disableForReducedMotion: true,
  };

  confetti({ ...defaults, ...options });
}

export function triggerLevelComplete() {
  // 彩纸从屏幕中央爆发
  triggerConfetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    gravity: 0.8,
    scalar: 1.2,
  });

  // 延迟后从两侧发射
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#6366F1', '#22C55E', '#FBBF24'],
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#6366F1', '#22C55E', '#FBBF24'],
    });
  }, 250);
}

export function triggerPerfectScore() {
  // 完美通关的金色特效
  triggerConfetti({
    particleCount: 200,
    spread: 120,
    colors: ['#FBBF24', '#F59E0B', '#FEF3C7'],
    scalar: 1.5,
    gravity: 0.6,
  });
}
```

**Step 2: 在 LevelView 中集成**

```tsx
// 在 LevelView 中导入
import { triggerLevelComplete } from '@/lib/confetti';

// 在关卡完成时触发
const handleLevelComplete = useCallback(() => {
  triggerLevelComplete();
  // ... 其他逻辑
}, []);
```

**Step 3: Commit**

```bash
git add lib/confetti.ts components/LevelView.tsx
git commit -m "feat: integrate canvas-confetti for level completion celebration"
```

---

## Phase 3: 高级功能 (Week 3)

### Task 3.1: 创建学习热力图组件

**Files:**
- Create: `components/gamification/StudyHeatmap.tsx`

**Step 1: 创建组件**

```tsx
// components/gamification/StudyHeatmap.tsx
'use client';

import { useMemo } from 'react';

interface HeatmapData {
  date: string;
  duration: number;
}

interface StudyHeatmapProps {
  data: HeatmapData[];
  year?: number;
}

export default function StudyHeatmap({ data, year = new Date().getFullYear() }: StudyHeatmapProps) {
  // 生成过去 365 天的日期网格
  const days = useMemo(() => {
    const today = new Date();
    const daysArray = [];
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      daysArray.push(date.toISOString().split('T')[0]);
    }
    
    return daysArray;
  }, []);

  // 获取某天的学习强度
  const getIntensity = (date: string): number => {
    const dayData = data.find(d => d.date === date);
    if (!dayData) return 0;
    if (dayData.duration < 15) return 1;
    if (dayData.duration < 30) return 2;
    if (dayData.duration < 60) return 3;
    return 4;
  };

  const intensityColors = [
    'bg-gray-100',      // 0 - 无学习
    'bg-green-200',     // 1 - <15分钟
    'bg-green-300',     // 2 - 15-30分钟
    'bg-green-500',     // 3 - 30-60分钟
    'bg-green-700',     // 4 - >60分钟
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">学习热力图</h3>
      <div className="flex gap-1 flex-wrap">
        {days.map((date, index) => (
          <div
            key={date}
            className={`w-3 h-3 rounded-sm ${intensityColors[getIntensity(date)]} hover:ring-2 hover:ring-gray-400 transition-all`}
            title={`${date}: ${data.find(d => d.date === date)?.duration || 0} 分钟`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>少</span>
        <div className="flex gap-1">
          {intensityColors.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
        </div>
        <span>多</span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/gamification/StudyHeatmap.tsx
git commit -m "feat: add StudyHeatmap component for activity visualization"
```

---

### Task 3.2: 创建成就徽章系统

**Files:**
- Create: `components/gamification/BadgeShowcase.tsx`
- Create: `data/badges.ts`

**Step 1: 创建徽章数据**

```typescript
// data/badges.ts
import { Badge } from '@/types/gamification';

export const BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: '初出茅庐',
    icon: '🏆',
    rarity: 'common',
    unlockedAt: null,
  },
  {
    id: 'learning-enthusiast',
    name: '学习达人',
    icon: '🏆',
    rarity: 'rare',
    unlockedAt: null,
  },
  {
    id: 'knowledge-master',
    name: '知识大师',
    icon: '🏆',
    rarity: 'epic',
    unlockedAt: null,
  },
  {
    id: 'streak-warrior',
    name: '连胜大师',
    icon: '🔥',
    rarity: 'rare',
    unlockedAt: null,
  },
  {
    id: 'super-streak',
    name: '超级连胜',
    icon: '🔥',
    rarity: 'epic',
    unlockedAt: null,
  },
  {
    id: 'speed-demon',
    name: '速度之星',
    icon: '⚡',
    rarity: 'rare',
    unlockedAt: null,
  },
  {
    id: 'perfectionist',
    name: '完美主义',
    icon: '🎯',
    rarity: 'epic',
    unlockedAt: null,
  },
  {
    id: 'course-collector',
    name: '课程收藏家',
    icon: '📚',
    rarity: 'rare',
    unlockedAt: null,
  },
];

export const BADGE_RARITY_COLORS = {
  common: 'bg-gray-200 border-gray-300',
  rare: 'bg-blue-200 border-blue-300',
  epic: 'bg-purple-200 border-purple-300',
  legendary: 'bg-yellow-200 border-yellow-300',
};
```

**Step 2: 创建徽章展示组件**

```tsx
// components/gamification/BadgeShowcase.tsx
'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/types/gamification';
import { BADGE_RARITY_COLORS } from '@/data/badges';
import { Lock } from 'lucide-react';

interface BadgeShowcaseProps {
  badges: Badge[];
}

export default function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">成就徽章</h3>
      <div className="grid grid-cols-4 gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative p-4 rounded-2xl border-2 text-center
              ${badge.unlockedAt 
                ? BADGE_RARITY_COLORS[badge.rarity]
                : 'bg-gray-100 border-gray-200 opacity-50'
              }
            `}
            title={badge.unlockedAt ? `解锁于 ${badge.unlockedAt}` : '未解锁'}
          >
            <div className="text-3xl mb-2">{badge.icon}</div>
            <div className="text-sm font-semibold">{badge.name}</div>
            {!badge.unlockedAt && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-2xl">
                <Lock size={20} className="text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add data/badges.ts components/gamification/BadgeShowcase.tsx
git commit -m "feat: add badge system with rarity levels"
```

---

### Task 3.3: 创建 Toast 通知系统

**Files:**
- Create: `components/ui/Toast.tsx`
- Create: `hooks/useToast.ts`

**Step 1: 创建 Toast 组件**

```tsx
// components/ui/Toast.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'badge' | 'xp';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subMessage?: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  badge: Trophy,
  xp: Sparkles,
};

const toastStyles = {
  success: 'bg-green-500',
  badge: 'bg-yellow-500',
  xp: 'bg-blue-500',
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`
        flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg
        ${toastStyles[toast.type]} text-white min-w-[300px]
      `}
    >
      <Icon size={24} />
      <div className="flex-1">
        <div className="font-bold">{toast.message}</div>
        {toast.subMessage && (
          <div className="text-sm opacity-90">{toast.subMessage}</div>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
}
```

**Step 2: 创建 Hook**

```typescript
// hooks/useToast.ts
'use client';

import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ui/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subMessage?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, subMessage?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message, subMessage }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    addToast('success', message);
  }, [addToast]);

  const showBadge = useCallback((badgeName: string) => {
    addToast('badge', '解锁新徽章！', badgeName);
  }, [addToast]);

  const showXP = useCallback((amount: number) => {
    addToast('xp', `+${amount} XP`, '获得经验值');
  }, [addToast]);

  return {
    toasts,
    removeToast,
    showSuccess,
    showBadge,
    showXP,
  };
}
```

**Step 3: Commit**

```bash
git add components/ui/Toast.tsx hooks/useToast.ts
git commit -m "feat: add Toast notification system for gamification events"
```

---

## Phase 4: 集成与优化 (Week 4)

### Task 4.1: 更新首页 (HomeView)

**Files:**
- Modify: `components/HomeView.tsx`

**Step 1: 添加游戏化组件**

```tsx
// 导入
import { StudyHeatmap } from '@/components/gamification/StudyHeatmap';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { BADGES } from '@/data/badges';

// 在 HomeView 中添加热力图和徽章展示
// 在适当位置插入：
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
>
  <StudyHeatmap data={[]} />
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
>
  <BadgeShowcase badges={BADGES} />
</motion.div>
```

**Step 2: Commit**

```bash
git add components/HomeView.tsx
git commit -m "feat: integrate StudyHeatmap and BadgeShowcase into HomeView"
```

---

### Task 4.2: 更新关卡详情 (CourseDetailView)

**Files:**
- Modify: `components/CourseDetailView.tsx`

**Step 1: 添加关卡星标**

在 LevelNode 组件中添加星级显示：

```tsx
// 导入
import LevelStars from './gamification/LevelStars';

// 在 LevelNode 中添加星级
<div className="flex flex-col items-center gap-2">
  <div className="...">
    {/* 现有关卡节点代码 */}
  </div>
  {level.stars > 0 && (
    <LevelStars stars={level.stars} size="sm" />
  )}
  <span className="text-sm font-semibold text-gray-700 max-w-[120px] text-center line-clamp-2">
    {level.title}
  </span>
</div>
```

**Step 2: Commit**

```bash
git add components/CourseDetailView.tsx
git commit -m "feat: add star ratings to level nodes in CourseDetailView"
```

---

### Task 4.3: 性能优化

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/providers/AnimationProvider.tsx`

**Step 1: 添加 reduced-motion 支持**

```tsx
// components/providers/AnimationProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      {children}
    </MotionConfig>
  );
}
```

**Step 2: 在 layout.tsx 中使用**

```tsx
// 在 providers 中添加
import AnimationProvider from '@/components/providers/AnimationProvider';

// 包裹应用
<AnimationProvider>
  {children}
</AnimationProvider>
```

**Step 3: Commit**

```bash
git add components/providers/AnimationProvider.tsx app/layout.tsx
git commit -m "feat: add reduced-motion support for accessibility"
```

---

## 验证清单

### 功能验证

- [ ] 按钮点击有 3D 按压效果
- [ ] 卡片悬停有上浮动画
- [ ] 连胜火焰有摇摆动画
- [ ] XP 进度环动画流畅
- [ ] 关卡完成触发 Confetti
- [ ] Toast 通知自动消失
- [ ] 徽章展示有悬停效果
- [ ] 热力图正确显示数据

### 性能验证

- [ ] 页面加载时间增加 < 200ms
- [ ] 动画保持 60fps（Chrome DevTools）
- [ ] 移动端动画流畅
- [ ] 支持 prefers-reduced-motion

### 响应式验证

- [ ] 桌面端布局正常
- [ ] 平板端适配良好
- [ ] 移动端触控区域足够（>44px）
- [ ] 移动端动画性能良好

---

**实施计划已完成，准备执行。**

**下一步：** 使用 `superpowers:executing-plans` 技能开始逐任务实施。
