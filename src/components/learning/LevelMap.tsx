'use client';

import { motion } from 'framer-motion';
import { Level } from '@/types';
import LevelNode from './LevelNode';

interface LevelMapProps {
  levels: Level[];
  activeLevelId: string | null;
  onLevelClick: (level: Level) => void;
}

export default function LevelMap({ levels, activeLevelId, onLevelClick }: LevelMapProps) {
  return (
    <div className="flex flex-col items-center py-20 relative max-w-md mx-auto">
      <div className="absolute top-0 bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-muted" />
      
      <div className="flex flex-col items-center gap-24 relative z-10 w-full">
        {levels.map((level, index) => {
          const isCompleted = level.status === 'completed';
          const isLast = index === levels.length - 1;
          
          return (
            <div key={level.id} className="relative flex flex-col items-center w-full">
              {!isLast && isCompleted && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-1.5 h-24 bg-duo-green" 
                  style={{ top: '100%' }}
                />
              )}
              
              <LevelNode
                level={level}
                index={index}
                isActive={activeLevelId === level.id}
                onClick={() => onLevelClick(level)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
