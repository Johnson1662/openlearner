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
    <div className="flex flex-col items-center space-y-8 py-8">
      {levels.map((level, index) => (
        <div key={level.id} className="relative">
          {index > 0 && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-200" />
          )}
          <LevelNode
            level={level}
            index={index}
            isActive={activeLevelId === level.id}
            onClick={() => onLevelClick(level)}
          />
        </div>
      ))}
    </div>
  );
}
