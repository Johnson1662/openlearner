export interface PresetAnimation {
  name: string;
  description: string;
  svg: string;
  width?: number;
  height?: number;
}

export const presetAnimations: PresetAnimation[] = [
  {
    name: 'circle-pulse',
    description: '圆圈脉冲效果 - 中心圆向外扩散的脉冲动画',
    width: 200,
    height: 200,
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="30" fill="none" stroke="#6366f1" stroke-width="3">
    <animate attributeName="r" values="30;60;30" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="100" r="15" fill="#6366f1"/>
</svg>`,
  },
  {
    name: 'wave-animation',
    description: '波动动画 - 正弦波在屏幕上移动',
    width: 300,
    height: 150,
    svg: `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
  <path fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round">
    <animate attributeName="d" 
      values="M0,75 Q37.5,25 75,75 T150,75 T225,75 T300,75;M0,75 Q37.5,125 75,75 T150,75 T225,75 T300,75;M0,75 Q37.5,25 75,75 T150,75 T225,75 T300,75"
      dur="3s" repeatCount="indefinite"/>
  </path>
</svg>`,
  },
  {
    name: 'spinning-loader',
    description: '旋转加载动画 - 经典的旋转圆环',
    width: 100,
    height: 100,
    svg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="6"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" stroke-width="6" stroke-linecap="round" stroke-dasharray="180" stroke-dashoffset="60">
    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
  {
    name: 'bouncing-dots',
    description: '弹跳圆点 - 三个圆点上下弹跳',
    width: 150,
    height: 100,
    svg: `<svg width="150" height="100" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="25" cy="70" r="10" fill="#6366f1">
    <animate attributeName="cy" values="70;30;70" dur="0.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="75" cy="70" r="10" fill="#6366f1">
    <animate attributeName="cy" values="70;30;70" dur="0.8s" begin="0.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="125" cy="70" r="10" fill="#6366f1">
    <animate attributeName="cy" values="70;30;70" dur="0.8s" begin="0.4s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
  {
    name: 'particle-flow',
    description: '粒子流动 - 小圆点从左向右流动',
    width: 300,
    height: 80,
    svg: `<svg width="300" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="0" cy="40" r="4" fill="#6366f1" opacity="0">
    <animate attributeName="cx" values="-10;310" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="0" cy="40" r="4" fill="#6366f1" opacity="0">
    <animate attributeName="cx" values="-10;310" dur="3s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="0" cy="40" r="4" fill="#6366f1" opacity="0">
    <animate attributeName="cx" values="-10;310" dur="3s" begin="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="2s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
  {
    name: 'gradient-circle',
    description: '渐变圆环 - 渐变色的圆环旋转',
    width: 120,
    height: 120,
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="45" fill="none" stroke="url(#grad)" stroke-width="8">
    <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
  {
    name: 'data-flow',
    description: '数据流动 - 像数据流一样的线条动画',
    width: 300,
    height: 60,
    svg: `<svg width="300" height="60" viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="25" width="300" height="10" rx="5" fill="#e5e7eb"/>
  <rect x="0" y="25" width="80" height="10" rx="5" fill="#6366f1">
    <animate attributeName="x" values="-80;300" dur="2s" repeatCount="indefinite"/>
  </rect>
</svg>`,
  },
  {
    name: 'neuron-network',
    description: '神经网络 - 模拟神经元连接的动画',
    width: 300,
    height: 200,
    svg: `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="100" r="8" fill="#6366f1"/>
  <circle cx="150" cy="50" r="8" fill="#8b5cf6"/>
  <circle cx="150" cy="100" r="8" fill="#8b5cf6"/>
  <circle cx="150" cy="150" r="8" fill="#8b5cf6"/>
  <circle cx="250" cy="100" r="8" fill="#ec4899"/>
  <line x1="50" y1="100" x2="150" y2="50" stroke="#6366f1" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="50" y1="100" x2="150" y2="100" stroke="#6366f1" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin="0.3s" repeatCount="indefinite"/>
  </line>
  <line x1="50" y1="100" x2="150" y2="150" stroke="#6366f1" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin="0.6s" repeatCount="indefinite"/>
  </line>
  <line x1="150" y1="50" x2="250" y2="100" stroke="#8b5cf6" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin="0.9s" repeatCount="indefinite"/>
  </line>
  <line x1="150" y1="100" x2="250" y2="100" stroke="#8b5cf6" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin="1.2s" repeatCount="indefinite"/>
  </line>
  <line x1="150" y1="150" x2="250" y2="100" stroke="#8b5cf6" stroke-width="2" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </line>
  <circle cx="50" cy="100" r="12" fill="none" stroke="#6366f1" stroke-width="2" opacity="0">
    <animate attributeName="r" values="8;20" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
  {
    name: 'clock-animation',
    description: '时钟动画 - 模拟时钟秒针转动',
    width: 150,
    height: 150,
    svg: `<svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="60" fill="none" stroke="#e5e7eb" stroke-width="4"/>
  <circle cx="75" cy="75" r="4" fill="#4b5563"/>
  <line x1="75" y1="75" x2="75" y2="35" stroke="#6366f1" stroke-width="3" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 75 75" to="360 75 75" dur="60s" repeatCount="indefinite"/>
  </line>
  <line x1="75" y1="75" x2="105" y2="75" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 75 75" to="360 75 75" dur="3s" repeatCount="indefinite"/>
  </line>
</svg>`,
  },
  {
    name: 'radar-scan',
    description: '雷达扫描 - 像雷达一样的扫描效果',
    width: 200,
    height: 200,
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="none" stroke="#374151" stroke-width="2"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="#374151" stroke-width="1"/>
  <circle cx="100" cy="100" r="20" fill="none" stroke="#374151" stroke-width="1"/>
  <line x1="100" y1="100" x2="180" y2="100" stroke="#6366f1" stroke-width="2">
    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="3s" repeatCount="indefinite"/>
  </line>
  <polygon points="100,100 180,90 180,110" fill="#6366f1" opacity="0.3">
    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="3s" repeatCount="indefinite"/>
  </polygon>
</svg>`,
  },
  {
    name: 'expanding-rings',
    description: '扩散圆环 - 从中心向外扩散的圆环',
    width: 200,
    height: 200,
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="10" fill="none" stroke="#6366f1" stroke-width="2">
    <animate attributeName="r" values="10;90" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="100" r="10" fill="none" stroke="#6366f1" stroke-width="2">
    <animate attributeName="r" values="10;90" dur="2s" begin="0.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="100" r="10" fill="none" stroke="#6366f1" stroke-width="2">
    <animate attributeName="r" values="10;90" dur="2s" begin="1s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0" dur="2s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="100" r="10" fill="none" stroke="#6366f1" stroke-width="2">
    <animate attributeName="r" values="10;90" dur="2s" begin="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0" dur="2s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>`,
  },
];

export function getAnimationByName(name: string): PresetAnimation | undefined {
  return presetAnimations.find(a => a.name === name);
}

export function getAnimationSVG(name: string): string {
  const anim = getAnimationByName(name);
  return anim ? anim.svg : '';
}
