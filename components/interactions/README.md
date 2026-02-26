# Brilliant-style Interaction Components

## Overview

Atomic interaction components following Brilliant.org's educational design philosophy:
- **Discovery-led (不教而教)**: Users discover concepts through experimentation
- **Tactile Feedback (物理手感)**: Magnetic snap, elastic bounce, cutting sensations
- **Scaffolding (认知支架)**: One small question per screen

## Components

### 1. Segmenter
Text segmentation with magnetic snap physics.

```tsx
import { Segmenter } from '@/components/interactions';

<Segmenter
  content="我爱学习人工智能"
  segments={[
    { id: '1', content: '我', isCorrect: true },
    { id: '2', content: '爱', isCorrect: true },
    { id: '3', content: '学习', isCorrect: true },
    { id: '4', content: '人工智能', isCorrect: true },
  ]}
  onSegment={(segments) => console.log(segments)}
  snapThreshold={20}
/>
```

### 2. Connector
Draw logical connections between nodes with elastic curves.

```tsx
import { Connector } from '@/components/interactions';

<Connector
  nodes={[
    { id: 'a', label: 'Input', x: 20, y: 50 },
    { id: 'b', label: 'Process', x: 50, y: 30 },
    { id: 'c', label: 'Output', x: 80, y: 50 },
  ]}
  correctConnections={[
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
  ]}
  onConnect={(connections) => console.log(connections)}
/>
```

### 3. Categorizer
Drag-and-drop classification with visual feedback.

```tsx
import { Categorizer } from '@/components/interactions';

<Categorizer
  items={[
    { id: '1', label: '苹果' },
    { id: '2', label: '香蕉' },
    { id: '3', label: '白菜' },
  ]}
  categories={[
    { id: 'fruit', label: '水果', color: '#f59e0b', items: ['1', '2'] },
    { id: 'veg', label: '蔬菜', color: '#10b981', items: ['3'] },
  ]}
  onCategorize={(items) => console.log(items)}
  checkCorrectness={(itemId, categoryId) => {
    // Return true/false/undefined for visual feedback
    const correctMapping: Record<string, string> = {
      '1': 'fruit', '2': 'fruit', '3': 'veg'
    };
    return correctMapping[itemId] === categoryId;
  }}
/>
```

### 4. FeedbackPanel
Success/error feedback with micro-animations.

```tsx
import { FeedbackPanel, ShakeWrapper, BounceWrapper, MicroButton } from '@/components/interactions';

// Feedback Panel
<FeedbackPanel
  type="success" // 'success' | 'error' | 'neutral'
  message="太棒了！你理解了这个概念。"
  hint="注意公式的第二项" // Shown for error type
  show={true}
  onContinue={() => console.log('Continue')}
  onRetry={() => console.log('Retry')}
/>

// Animation wrappers
<ShakeWrapper shake={hasError}>
  <button>Submit</button>
</ShakeWrapper>

<BounceWrapper bounce={isSuccess}>
  <div>Success!</div>
</BounceWrapper>

<MicroButton onClick={handleClick} variant="primary">
  Click Me
</MicroButton>
```

## Updated Level Flow

The new Brilliant-style level flow consists of 4 stages:

1. **Experiment (动手实验)**: User performs an operation first
2. **Discovery (发现规律)**: Reveal the core concept after experimentation  
3. **Explanation (知识讲解)**: Formal explanation with visual aids
4. **Challenge (挑战练习)**: Interactive questions with FeedbackPanel

## Updated Types

```typescript
// types/index.ts

export type InteractionType = 
  | 'segmenter' 
  | 'connector' 
  | 'categorizer' 
  | 'multiple_choice' 
  | 'ordering' 
  | 'fill_blank';

export interface VisualAsset {
  type: 'image' | 'diagram' | 'formula';
  src?: string;
  alt?: string;
  latex?: string;
}

export type LevelStage = 'experiment' | 'discovery' | 'explanation' | 'challenge';
```

## Key Features

### Magnetic Snap Physics
- Segment markers snap to word boundaries
- Connector lines have spring physics
- Drop zones highlight when hovering

### Tactile Feedback
- `whileTap={{ scale: 0.95 }}` on all interactive elements
- Spring animations with stiffness/damping
- Visual state changes (color, border, shadow)

### Micro-animations
- Success: Bounce + cyan background + gradient button
- Error: Shake + rose background + retry button
- Transitions: Spring physics with AnimatePresence

## Usage in LevelView

The LevelView component now uses the new 4-stage flow:
- Displays stage labels and colors dynamically
- Integrates FeedbackPanel for quiz feedback
- Supports retry functionality with shake animation
- Each stage has its own visual theme
