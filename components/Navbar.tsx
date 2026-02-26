'use client';

import { motion } from 'framer-motion';
import { Home, BookOpen, Zap, Target } from 'lucide-react';
import { PageView, UserProgress } from '@/types';

interface NavbarProps {
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  progress: UserProgress;
}

export default function Navbar({ currentView, onViewChange, progress }: NavbarProps) {
  const isActive = (view: PageView) => currentView === view;

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-50">
      {/* Left - Logo & Navigation */}
      <div className="flex items-center space-x-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="text-2xl font-bold tracking-tighter cursor-pointer"
          onClick={() => onViewChange('home')}
        >
          OpenLearner
        </motion.div>
        <div className="hidden md:flex space-x-6 text-gray-500 font-medium">
          <motion.a
            href="#"
            onClick={(e) => { e.preventDefault(); onViewChange('home'); }}
            className={`hover:text-black transition-colors ${isActive('home') ? 'text-black border-b-2 border-black pb-1' : ''}`}
          >
            首页
          </motion.a>
          <motion.a
            href="#"
            onClick={(e) => { e.preventDefault(); onViewChange('courses'); }}
            className={`hover:text-black transition-colors ${(isActive('courses') || isActive('course-detail')) ? 'text-black border-b-2 border-black pb-1' : ''}`}
          >
            课程
          </motion.a>
        </div>
      </div>

      {/* Right - Stats & Menu */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 font-bold">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-indigo-600" />
            {progress?.completedLevels?.length ?? 0}
          </span>
          <span className="text-yellow-500 flex items-center gap-1">
            <Zap className="w-4 h-4 fill-yellow-500" />
            {progress?.currentStreak ?? 0}
          </span>
        </div>
        <div className="text-xl cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
          ☰
        </div>
      </div>
    </nav>
  );
}
