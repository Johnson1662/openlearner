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
      className="sticky top-0 z-50 px-6 py-4"
    >
      <div className="glass-card px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">
              OpenLearner
            </span>
          </motion.div>
          
          <nav className="hidden md:flex space-x-1">
            <a href="#" className="px-4 py-2 rounded-xl text-text-secondary font-medium hover:text-text-primary hover:bg-white/50 transition-all">
              首页
            </a>
            <a href="#" className="px-4 py-2 rounded-xl text-text-primary font-semibold bg-white/60">
              课程
            </a>
            <a href="#" className="px-4 py-2 rounded-xl text-text-secondary font-medium hover:text-text-primary hover:bg-white/50 transition-all">
              进度
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Crown className="w-4 h-4" />
            升级会员
          </motion.button>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 glass-card px-3 py-2"
          >
            <span className="font-bold text-text-primary">{progress.completedLevels.length}</span>
            <KeyRound className="w-4 h-4 text-brand-primary" />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 glass-card px-3 py-2"
          >
            <span className="font-bold text-text-primary">{progress.energy}</span>
            <Zap className="w-4 h-4 text-brand-cta fill-brand-cta" />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
