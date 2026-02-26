'use client';

import { motion } from 'framer-motion';
import { Home, BookOpen, Zap, Target, Menu, X } from 'lucide-react';
import { PageView, UserProgress } from '@/types';
import { useState } from 'react';

interface NavbarProps {
  currentView: PageView;
  onViewChange: (view: PageView) => void;
  progress: UserProgress;
}

export default function Navbar({ currentView, onViewChange, progress }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (view: PageView) => currentView === view;

  const navItems: { view: PageView; label: string; match?: PageView[] }[] = [
    { view: 'home', label: '首页' },
    { view: 'courses', label: '课程', match: ['courses', 'course-detail'] },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(250, 250, 250, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="max-w-[980px] mx-auto px-6 flex items-center justify-between h-12">
        {/* Logo */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onViewChange('home')}
          className="text-[17px] font-semibold tracking-tight cursor-pointer"
          style={{ color: '#1d1d1f' }}
        >
          OpenLearner
        </motion.button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = isActive(item.view) || (item.match?.includes(currentView) ?? false);
            return (
              <motion.button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                whileTap={{ scale: 0.97 }}
                className="text-[13px] font-normal transition-colors duration-200 cursor-pointer relative py-1"
                style={{ color: active ? '#1d1d1f' : '#6e6e73' }}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] rounded-full"
                    style={{ background: '#1d1d1f' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right side - Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-[13px]">
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: '#6e6e73' }}
            >
              <Target className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
              {progress?.completedLevels?.length ?? 0}
            </span>
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: '#6e6e73' }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />
              {progress?.currentStreak ?? 0}
            </span>
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden p-1 -mr-1 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" style={{ color: '#1d1d1f' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: '#1d1d1f' }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden px-6 pb-4"
          style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
        >
          {navItems.map((item) => {
            const active = isActive(item.view) || (item.match?.includes(currentView) ?? false);
            return (
              <button
                key={item.view}
                onClick={() => {
                  onViewChange(item.view);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2.5 text-[15px] cursor-pointer transition-colors"
                style={{
                  color: active ? '#1d1d1f' : '#6e6e73',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </button>
            );
          })}
          <div className="flex items-center gap-4 pt-2 text-[13px]" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="flex items-center gap-1 font-medium py-2" style={{ color: '#6e6e73' }}>
              <Target className="w-3.5 h-3.5" style={{ color: '#007AFF' }} />
              {progress?.completedLevels?.length ?? 0} 完成
            </span>
            <span className="flex items-center gap-1 font-medium py-2" style={{ color: '#6e6e73' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#FF9F0A', fill: '#FF9F0A' }} />
              {progress?.currentStreak ?? 0} 连续
            </span>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
