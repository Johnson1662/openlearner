'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ progress, showPercentage, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-600">
            进度 {progress}%
          </span>
        )}
        <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      </div>
      
      <div className="flex justify-between px-1">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <motion.div
            key={milestone}
            className={`w-2 h-2 rounded-full transition-colors duration-300
              ${progress >= milestone ? 'bg-indigo-500' : 'bg-gray-300'}`}
            animate={progress >= milestone ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
