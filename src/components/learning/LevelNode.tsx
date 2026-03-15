'use client';

import { Lock, CheckCircle, Play, Star, Zap } from 'lucide-react';
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center group cursor-pointer w-full relative"
    >
      <div className="relative">
        <motion.button
          whileHover={!isLocked ? { 
            scale: 1.1, 
            y: -10,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          } : {}}
          whileTap={!isLocked ? { scale: 0.95 } : {}}
          onClick={onClick}
          disabled={isLocked}
          className={`
            relative w-24 h-24 rounded-[40px]
            flex items-center justify-center
            transition-all duration-300
            shadow-xl
            ${isLocked 
              ? 'bg-muted text-duo-grayDark shadow-none cursor-not-allowed opacity-60' 
              : isCompleted
              ? 'bg-white text-duo-green border-4 border-duo-green'
              : isActive
              ? 'bg-primary text-white shadow-[0_15px_30px_-5px_rgba(130,87,229,0.4)]'
              : 'bg-white text-duo-text border-2 border-duo-gray hover:border-primary'
            }
          `}
        >
          <div className="text-4xl">
            {isLocked ? (
              <Lock className="w-8 h-8 opacity-40" />
            ) : isCompleted ? (
              <div className="relative">
                <CheckCircle className="w-12 h-12" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4 bg-duo-gold text-white p-1 rounded-full shadow-lg"
                >
                  <Star className="w-4 h-4 fill-current" />
                </motion.div>
              </div>
            ) : isActive ? (
              <Play className="w-10 h-10 fill-current ml-1" />
            ) : (
              <span className="text-2xl font-black">{level.order}</span>
            )}
          </div>
        </motion.button>

        {isActive && (
          <motion.div 
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-primary"
          >
            START HERE
          </motion.div>
        )}
      </div>

      <div className="mt-6 text-center max-w-[200px]">
        <h3 className={`text-lg font-black transition-colors ${
          isLocked ? 'text-duo-grayDark' : isActive ? 'text-primary' : 'text-duo-text'
        }`}>
          {level.title}
        </h3>
        {!isLocked && (
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Zap className="w-4 h-4 text-duo-gold fill-current" />
            <span className="text-sm font-bold text-duo-textSoft">+{level.xpReward} XP</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
