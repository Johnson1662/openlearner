'use client';

import { motion } from 'framer-motion';
import { Crown, Zap, KeyRound, Sparkles } from 'lucide-react';
import { UserProgress } from '@/types';

interface HeaderProps {
  progress: UserProgress;
}

export default function Header({ progress }: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 px-6 py-3"
      style={{
        background: 'rgba(250, 250, 250, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center justify-between max-w-[980px] mx-auto">
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#1d1d1f' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#fff' }} />
            </div>
            <span
              className="text-[17px] font-semibold tracking-tight"
              style={{ color: '#1d1d1f' }}
            >
              OpenLearner
            </span>
          </motion.div>
          
          <nav className="hidden md:flex gap-6">
            {['Home', 'Courses', 'Progress'].map((item, i) => (
              <a
                key={item}
                href="#"
                className="text-[13px] font-normal transition-colors"
                style={{ color: i === 1 ? '#1d1d1f' : '#6e6e73' }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="flex items-center gap-1 font-medium" style={{ color: '#6e6e73' }}>
              <KeyRound className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
              {progress.completedLevels.length}
            </span>
            <span className="flex items-center gap-1 font-medium" style={{ color: '#6e6e73' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />
              {progress.energy}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
