'use client';

import { Lock, CheckCircle, Play, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Level } from '@/types';

interface LevelNodeProps {
  level: Level;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export default function LevelNode({ level, index, isActive, onClick }: LevelNodeProps) {
  const isLocked = level.status === 'locked';
  const isCompleted = level.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center group cursor-pointer"
    >
      {isActive && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-cta/20 flex items-center justify-center">
            <Unlock className="w-4 h-4 text-brand-cta" />
          </div>
        </motion.div>
      )}
      
      <motion.button
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={isLocked}
        className={`
          relative w-[60px] h-[40px] rounded-full
          flex items-center justify-center
          transition-all duration-200
          ${isLocked 
            ? 'bg-gray-200 shadow-[0_4px_0_#d1d5db] opacity-50 cursor-not-allowed' 
            : isCompleted
            ? 'bg-gradient-to-r from-brand-cta to-emerald-400 shadow-[0_4px_0_#059669,0_0_15px_rgba(16,185,129,0.4)]'
            : isActive
            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_4px_0_#4F46E5,0_0_15px_rgba(99,102,241,0.4)]'
            : 'bg-gray-200 shadow-[0_4px_0_#d1d5db] hover:bg-gray-300'
          }
        `}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 text-gray-400" />
        ) : isCompleted ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : isActive ? (
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        ) : (
          <span className="text-xs font-bold text-gray-500">{level.order}</span>
        )}
      </motion.button>

      <span className={`mt-2 text-sm font-medium ${
        isLocked ? 'text-gray-400' : isActive ? 'font-bold text-text-primary' : 'text-text-secondary'
      }`}>
        {level.title}
      </span>
      
      {!isLocked && (
        <span className="text-xs text-brand-cta font-semibold mt-0.5">+{level.xpReward} XP</span>
      )}
    </motion.div>
  );
}
