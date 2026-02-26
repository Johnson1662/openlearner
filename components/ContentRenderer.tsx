'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { presetAnimations } from '@/lib/animations/presets';

interface ContentRendererProps {
  content: string;
  className?: string;
}

function renderLatex(content: string): string {
  const inlineFormulaRegex = /\$([^$]+)\$/g;
  const blockFormulaRegex = /\$\$([^$]+)\$\$/g;
  
  let result = content;
  
  result = result.replace(blockFormulaRegex, (_, formula) => {
    try {
      return `<div class="katex-block">${katex.renderToString(formula, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="text-red-500">[公式错误: ${formula}]</div>`;
    }
  });
  
  result = result.replace(inlineFormulaRegex, (_, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-red-500">[公式错误]</span>`;
    }
  });
  
  return result;
}

function renderPresetAnimations(content: string): string {
  let result = content;
  
  for (const preset of presetAnimations) {
    const regex = new RegExp(`\\[animation:${preset.name}\\]`, 'g');
    result = result.replace(regex, preset.svg);
  }
  
  return result;
}

export default function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    let processed = renderLatex(content);
    processed = renderPresetAnimations(processed);
    setProcessedContent(processed);
  }, [content]);

  useEffect(() => {
    if (!containerRef.current || !processedContent) return;

    containerRef.current.innerHTML = processedContent;

    const SVGs = containerRef.current.querySelectorAll('svg');
    SVGs.forEach((svg) => {
      svg.setAttribute('data-animated', 'true');
      const animateElements = svg.querySelectorAll('animate, animateTransform');
      animateElements.forEach((el) => {
        if ('beginElement' in el && typeof (el as any).beginElement === 'function') {
          try {
            (el as any).beginElement();
          } catch (e) {}
        }
      });
    });
  }, [processedContent]);

  return (
    <div 
      ref={containerRef}
      className={`content-renderer ${className}`}
      style={{
        '--katex-font-size': '1.1em',
      } as React.CSSProperties}
    />
  );
}
