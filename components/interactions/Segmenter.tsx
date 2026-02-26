'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

interface Segment {
  id: string;
  content: string;
  isCorrect?: boolean;
}

interface SegmenterProps {
  content: string;
  segments?: Segment[];
  onSegment: (segments: string[]) => void;
}

export default function Segmenter({ 
  content, 
  onSegment 
}: SegmenterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  
  const chars = useMemo(() => content.split(''), [content]);
  const gapCount = chars.length - 1;

  const handleGapClick = (index: number) => {
    if (markers.includes(index)) {
      setMarkers(prev => prev.filter(m => m !== index));
    } else {
      setMarkers(prev => [...prev, index].sort((a, b) => a - b));
    }
  };

  const currentSegments = useMemo(() => {
    const result: string[] = [];
    let current = '';
    chars.forEach((char, i) => {
      current += char;
      if (markers.includes(i) || i === chars.length - 1) {
        result.push(current);
        current = '';
      }
    });
    return result;
  }, [chars, markers]);

  useEffect(() => {
    onSegment(currentSegments);
  }, [currentSegments, onSegment]);

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        className="relative flex items-center bg-[#F7F7F7] p-8 rounded-[24px] border-2 border-[#E5E5E5] shadow-inner"
        style={{ minHeight: '120px' }}
      >
        <div className="flex items-center gap-0">
          {chars.map((char, i) => (
            <div key={i} className="flex items-center">
              <motion.div 
                className="text-4xl font-black text-[#4B4B4B] px-1"
                layout
              >
                {char}
              </motion.div>
              
              {i < chars.length - 1 && (
                <div 
                  className="relative w-4 h-12 cursor-pointer group"
                  onClick={() => handleGapClick(i)}
                >
                  <motion.div 
                    className={`
                      absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 rounded-full transition-all
                      ${markers.includes(i) 
                        ? 'bg-[#1CB0F6] opacity-100' 
                        : 'bg-indigo-100 opacity-0 group-hover:opacity-50'}
                    `}
                    initial={false}
                    animate={markers.includes(i) ? { height: '100%' } : { height: '40%' }}
                  />
                  
                  {markers.includes(i) && (
                    <motion.div 
                      className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white mix-blend-overlay"
                      layoutId={`cut-${i}`}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <AnimatePresence mode="popLayout">
          {currentSegments.map((seg, i) => (
            <motion.div
              key={`${i}-${seg}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-6 py-3 bg-white border-2 border-[#E5E5E5] rounded-[16px] shadow-[0_4px_0_0_#E5E5E5] text-xl font-black text-[#4B4B4B]"
            >
              {seg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-[#AFAFAF] font-bold text-sm uppercase tracking-widest">
        Click between characters to segment
      </p>
    </div>
  );
}

